import mysql.connector
import pandas as pd
from pyspark.sql import SparkSession
from pyspark.ml.feature import Tokenizer, StopWordsRemover, HashingTF, IDF
from pyspark.sql.functions import udf
from pyspark.ml.linalg import Vectors, VectorUDT
import numpy as np

# 1. Initialize Spark Session
spark = SparkSession.builder \
    .appName("CourseSimilarity") \
    .config("spark.driver.host", "localhost") \
    .getOrCreate()

def get_similarity_pipeline():
    try:
        # 2. Connect to MySQL and Fetch Data
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="Albania100$",
            database="course_aggregator"
        )
        query = "SELECT id, title, description FROM courses"
        df = pd.read_sql(query, conn)
        
        if df.empty:
            print("⚠️ No courses found in database.")
            return

        # Convert to Spark DataFrame
        ds = spark.createDataFrame(df)

        # 3. Text Processing Pipeline
        tokenizer = Tokenizer(inputCol="description", outputCol="words")
        wordsData = tokenizer.transform(ds)

        remover = StopWordsRemover(inputCol="words", outputCol="filtered")
        filteredData = remover.transform(wordsData)

        # Vectorize using TF-IDF
        hashingTF = HashingTF(inputCol="filtered", outputCol="rawFeatures", numFeatures=1000)
        featurizedData = hashingTF.transform(filteredData)

        idf = IDF(inputCol="rawFeatures", outputCol="features")
        idfModel = idf.fit(featurizedData)
        rescaledData = idfModel.transform(featurizedData)

        # 4. Calculate Similarity (Cosine Similarity)
        features = rescaledData.select("id", "features").collect()
        
        print("🚀 Calculating similarities...")
        for i in range(len(features)):
            current_id = features[i]['id']
            current_vec = features[i]['features'].toArray()
            
            similarities = []
            for j in range(len(features)):
                if i == j: continue # Don't compare course to itself
                
                other_id = features[j]['id']
                other_vec = features[j]['features'].toArray()
                
                # Cosine Similarity Formula
                dot_product = np.dot(current_vec, other_vec)
                norm_a = np.linalg.norm(current_vec)
                norm_b = np.linalg.norm(other_vec)
                score = dot_product / (norm_a * norm_b) if (norm_a * norm_b) != 0 else 0
                
                if score > 0.1: # Threshold for similarity
                    similarities.append(str(other_id))

            # 5. Update Database with similar IDs
            sim_ids_str = ",".join(similarities)
            cursor = conn.cursor()
            update_query = "UPDATE courses SET similar_ids = %s WHERE id = %s"
            cursor.execute(update_query, (sim_ids_str, current_id))
            conn.commit()

        print("✅ Database updated with recommendations!")
        conn.close()

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    get_similarity_pipeline()
    spark.stop()