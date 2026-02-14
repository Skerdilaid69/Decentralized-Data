import mysql.connector
import numpy as np
from pyspark.sql import SparkSession
from pyspark.ml.feature import Tokenizer, HashingTF, IDF, Normalizer, StopWordsRemover
from pyspark.ml.clustering import KMeans
from pyspark.sql.functions import concat_ws, col
from pyspark.sql import functions as F
from pyspark.sql.window import Window

DB_HOST = "localhost"
DB_USER = "root"
DB_PASSWORD = "Albania100$"
DB_NAME = "course_aggregator"
DB_PORT = "3306"

jdbc_url = f"jdbc:mysql://{DB_HOST}:{DB_PORT}/{DB_NAME}"
db_props = {
    "user": DB_USER,
    "password": DB_PASSWORD,
    "driver": "com.mysql.cj.jdbc.Driver"    
}

def run_clustering(df, jdbc_url, db_props):
    cat_tokenizer = Tokenizer(inputCol="category", outputCol="cat_words")
    cat_words = cat_tokenizer.transform(df)

    cat_hashing = HashingTF(inputCol="cat_words", outputCol="cat_features", numFeatures=200)
    cat_tf = cat_hashing.transform(cat_words)

    cat_normalizer = Normalizer(inputCol="cat_features", outputCol="cat_norm_features")
    final_data = cat_normalizer.transform(cat_tf)

    kmeans = KMeans(featuresCol="cat_norm_features", predictionCol="cluster_id", k=5, seed=42)
    model = kmeans.fit(final_data)

    clustered_data = model.transform(final_data)

    category_counts = clustered_data.groupBy("cluster_id", "category").agg(F.count("*").alias("cnt"))
    window_spec = Window.partitionBy("cluster_id").orderBy(F.desc("cnt"))
    cluster_labels = category_counts.withColumn("rank", F.row_number().over(window_spec)) \
        .filter(col("rank") == 1) \
        .select(col("cluster_id"), col("category").alias("cluster_name"))
    
    cluster_labels.write.jdbc(url=jdbc_url, table="cluster_labels", mode="overwrite", properties=db_props)

    final_clusters = clustered_data.select(col("id").alias("course_id"), col("cluster_id"))
    final_clusters.write.jdbc(url=jdbc_url, table="course_clusters", mode="overwrite", properties=db_props)

def run_similarity(df, spark, jdbc_url, db_props):
    df_clean = df.withColumn("text_content", concat_ws(" ", col("title"), col("description")))

    tokenizer = Tokenizer(inputCol="text_content", outputCol="words")
    words_data = tokenizer.transform(df_clean)

    remover = StopWordsRemover(inputCol="words", outputCol="filtered_words")
    words_clean = remover.transform(words_data)

    hashing_tf = HashingTF(inputCol="filtered_words", outputCol="raw_features", numFeatures=1000)
    featurized_data = hashing_tf.transform(words_clean)

    idf = IDF(inputCol="raw_features", outputCol="features")
    idf_model = idf.fit(featurized_data)
    rescaled_data = idf_model.transform(featurized_data)

    normalizer = Normalizer(inputCol="features", outputCol="norm_features")
    normalized_data = normalizer.transform(rescaled_data)

    data_list = normalized_data.select("id", "norm_features").collect()
    
    ids = [row['id'] for row in data_list]
    vectors = np.array([row['norm_features'].toArray() for row in data_list])

    similarity_matrix = np.dot(vectors, vectors.T)

    recommendations = []
    for i in range(len(ids)):
        scores = []
        for j in range(len(ids)):
            if i == j: continue
            score = float(similarity_matrix[i, j])
            if score > 0.1:
                scores.append((ids[i], ids[j], score))
        
        scores.sort(key=lambda x: x[2], reverse=True)
        recommendations.extend(scores[:5])

    rec_df = spark.createDataFrame(recommendations, ["course_id", "recommended_course_id", "similarity_score"])
    rec_df.write.jdbc(url=jdbc_url, table="course_recommendations", mode="overwrite", properties=db_props)

spark = SparkSession.builder \
    .appName("CourseML") \
    .config("spark.driver.host", "localhost") \
    .config("spark.jars.packages", "mysql:mysql-connector-java:8.0.28") \
    .getOrCreate()

try:
    raw_df = spark.read.jdbc(url=jdbc_url, table="courses", properties=db_props)
    df = raw_df.na.fill({"category": "Uncategorized", "title": "", "description": ""})

    run_clustering(df, jdbc_url, db_props)
    run_similarity(df, spark, jdbc_url, db_props)

    print("\n--- ML Job Completed Successfully ---")

except Exception as e:
    print(f"\nCritical Error: {e}")
finally:
    spark.stop()