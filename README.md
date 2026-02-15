# Decentralized-Data
Github Repository of 2025-26 Project in Decentralized Data Engineering and Technologies
# Course Aggregator & ML Recommender System

Αυτό το project υλοποιεί έναν **Horizontal Aggregator Ανοικτών Μαθημάτων** που συγκεντρώνει δεδομένα από πολλαπλές πηγές.pdf]. Προσφέρει μια ενιαία διεπαφή αναζήτησης σε React και χρησιμοποιεί **Apache Spark** για επεξεργασία δεδομένων μεγάλης κλίμακας, παραγωγή συστάσεων και ομαδοποίηση μαθημάτων.pdf].

---

## 1. Προαπαιτούμενα

Για την ορθή λειτουργία της εφαρμογής, απαιτούνται τα εξής:
* **Node.js** (v14+)
* **MySQL Server**
* **Python 3.x**
* **Apache Spark** (με PySpark και MLlib)
* **Java JDK 8 ή 11**
* **MySQL Connector for Spark** (αρχείο .jar)

---

## 2. Ρύθμιση Βάσης Δεδομένων

1. Συνδεθείτε στο MySQL περιβάλλον σας.
2. Εκτελέστε το αρχείο **create.sql** για τη δημιουργία της βάσης `course_aggregator`.
3. Δημιουργούνται αυτόματα οι πίνακες: `providers`, `courses`, `course_recommendations`, `course_clusters`, `cluster_labels`, `users`, `bookmarks` και `history`.

---

## 3. Ρύθμιση Back-End

1. Μεταβείτε στον φάκελο `BackEnd`.
2. Εγκαταστήστε τις εξαρτήσεις με την εντολή: `npm install`.
3. Δημιουργήστε ένα αρχείο **.env** στον φάκελο `BackEnd` με την εξής δομή:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=siout@s7
DB_NAME=course_aggregator
DB_PORT=3306
JWT_SECRET=se55555....
MYSQL_JAR_PATH=/path/to/mysql-connector-java-8.0.28.jar

---

## 4. Ρύθμιση Front-End

1. Μεταβείτε στον φάκελο `FrontEnd`.
2. Εγκαταστήστε τις εξαρτήσεις με την εντολή: `npm install`.

---

## 5. Ρύθμιση Spark (Ειδικά για Windows)

Λόγω των απαιτήσεων του Spark σε περιβάλλον Windows, έχουν υλοποιηθεί ειδικά αρχεία ρυθμίσεων:
* **Αρχεία Εκτέλεσης**: Χρησιμοποιήστε το `ml_pipeline_Windows.py` για την εκτέλεση των ML jobs σε Windows.
* **Spark Configuration**: Το αρχείο `spark_config.py` ρυθμίζει αυτόματα τις μεταβλητές περιβάλλοντος `HADOOP_HOME` και `PYSPARK_PYTHON`, καθώς και τις παραμέτρους Java `JDK_JAVA_OPTIONS` για την αποφυγή σφαλμάτων μνήμης.
* **Winutils**: Διασφαλίστε ότι το `winutils.exe` βρίσκεται στον φάκελο `bin` της διαδρομής `HADOOP_HOME`.

---

## 6. Οδηγίες Εκτέλεσης

1. **Εκκίνηση Back-End**: Εκτελέστε `node server.js`. Ο server εκτελεί αυτόματα έναν αρχικό συγχρονισμό δεδομένων κατά την εκκίνηση.
2. **Εκκίνηση Front-End**: Εκτελέστε `npm start` στο φάκελο του FrontEnd. Η εφαρμογή είναι διαθέσιμη στο http://localhost:3000.
3. **Εκτέλεση Spark ML Job**: Τρέξτε χειροκίνητα την εντολή `python ml_pipeline_Windows.py` για τον υπολογισμό των συστάσεων και των clusters.

---

## 7. Λειτουργίες Συστήματος

* **Aggregation**: Συλλογή δεδομένων από Microsoft Learn και Coursera.
* **Search & Filter**: Αναζήτηση και φιλτράρισμα ανά γλώσσα, επίπεδο, πηγή και κατηγορία.
* **Recommendations**: Εμφάνιση παρόμοιων μαθημάτων στη σελίδα λεπτομερειών βάσει TF-IDF και Cosine Similarity.
* **Thematic Clustering**: Ομαδοποίηση μαθημάτων σε clusters με ονόματα που προκύπτουν από την επικρατέστερη κατηγορία (Weighted Labeling).
* **Personalization**: Υποστήριξη λογαριασμών χρηστών με Bookmarks και Ιστορικό προβολών.
* **Analytics**: Απεικόνιση στατιστικών για την κατανομή των μαθημάτων.

---

### Μαθηματική Τεκμηρίωση Συστάσεων

Η ομοιότητα μεταξύ δύο μαθημάτων $A$ και $B$ υπολογίζεται μέσω του Cosine Similarity στα διανύσματα TF-IDF:

$$\text{similarity}(A, B) = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|}$$



Επειδή τα διανύσματα κανονικοποιούνται από το Spark ML Pipeline, ο υπολογισμός γίνεται μέσω του εσωτερικού γινομένου των διανυσμάτων.
