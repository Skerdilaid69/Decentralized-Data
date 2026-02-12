import os
from dotenv import load_dotenv
from pyspark.sql import SparkSession

load_dotenv(dotenv_path='../BackEnd/.env')

def get_spark_session(app_name="CourseRecommendationJob"):
    os.environ['HADOOP_HOME'] = os.getenv('HADOOP_HOME')
    os.environ['PYSPARK_PYTHON'] = os.getenv('PYSPARK_PYTHON')
    os.environ['PYSPARK_DRIVER_PYTHON'] = os.getenv('PYSPARK_PYTHON')
    
    if 'JDK_JAVA_OPTIONS' in os.environ:
        del os.environ['JDK_JAVA_OPTIONS']
    
    java_opts = "--add-opens=java.base/java.nio=ALL-UNNAMED --add-opens=java.base/sun.nio.ch=ALL-UNNAMED"
    os.environ['JDK_JAVA_OPTIONS'] = java_opts

    return SparkSession.builder \
        .appName(app_name) \
        .master("local[1]") \
        .config("spark.driver.memory", "2g") \
        .config("spark.executor.memory", "2g") \
        .config("spark.jars", os.getenv('MYSQL_JAR_PATH')) \
        .config("spark.driver.host", "127.0.0.1") \
        .config("spark.driver.extraJavaOptions", java_opts) \
        .config("spark.executor.extraJavaOptions", java_opts) \
        .getOrCreate()

def get_db_url():
    host = os.getenv('DB_HOST')
    port = os.getenv('DB_PORT')
    name = os.getenv('DB_NAME')
    return f"jdbc:mysql://{host}:{port}/{name}"

def get_db_properties():
    return {
        "user": os.getenv('DB_USER'),
        "password": os.getenv('DB_PASSWORD'),
        "driver": "com.mysql.cj.jdbc.Driver"
    }