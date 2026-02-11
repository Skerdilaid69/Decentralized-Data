import mysql.connector
import numpy as np
from pyspark.sql import SparkSession
from pyspark.ml.feature import Tokenizer, StopWordsRemover, HashingTF, IDF
from pyspark.sql.functions import udf
from pyspark.ml.linalg import Vectors, VectorUDT
from pyspark.sql.functions import concat_ws, col, udf # Added missing imports
from pyspark.ml.feature import Normalizer # Added missing import


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


# 1. Initialize Spark Session
spark = SparkSession.builder \
    .appName("CourseSimilarity") \
    .config("spark.driver.host", "localhost") \
    .config("spark.jars.packages", "mysql:mysql-connector-java:8.0.28") \
    .getOrCreate()

try:
    df = spark.read.jdbc(url=jdbc_url, table="courses", properties=db_props)
    df_clean = df.withColumn("text_content", concat_ws(" ", col("title"), col("description")))

    tokenizer = Tokenizer(inputCol="text_content", outputCol="words")
    words_data = tokenizer.transform(df_clean)

    hashing_tf = HashingTF(inputCol="words", outputCol="raw_features", numFeatures=1000)
    featurized_data = hashing_tf.transform(words_data)

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

    print("\n--- ML Job Completed Successfully ---")

except Exception as e:
    print(f"\nCritical Error: {e}")
finally:
    spark.stop()