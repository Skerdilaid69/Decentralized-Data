import numpy as np
from spark_config import get_spark_session, get_db_url, get_db_properties
from pyspark.ml.feature import Tokenizer, HashingTF, IDF, Normalizer
from pyspark.sql.functions import col, concat_ws

spark = get_spark_session()
jdbc_url = get_db_url()
db_props = get_db_properties()

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