from flask import Flask, request, send_from_directory
from flask_cors import CORS

from ultralytics import YOLO
from PIL import Image
import io
import base64
import psycopg2
import psycopg2.extras
import os
import tensorflow as tf
from keras.applications.resnet50 import preprocess_input
import numpy as np
import pickle
from numpy.linalg import norm
from sklearn.neighbors import NearestNeighbors
from dotenv import load_dotenv


load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])


# fashion object detection
@app.route('/detect-image', methods=["POST"])
def detect_image():
    req = request.get_json()

    image_str = req["image"]
    image_data = image_str.split(",")[1]  # remove the header of the base64 string
    image_bytes = base64.b64decode(image_data)  # decode the base64 string
    image = Image.open(io.BytesIO(image_bytes))

    model = YOLO('detect.pt')
    results = model.predict(source=image)

    boxes = results[0].boxes.xyxy.tolist()
    classes = results[0].boxes.cls.tolist()
    names = results[0].names
    confidences = results[0].boxes.conf.tolist()

    response = {
        "boundingBoxes": []
    }

    for box, cls, conf in zip(boxes, classes, confidences):
        response["boundingBoxes"].append({
            "x1": box[0],
            "y1": box[1],
            "x2": box[2],
            "y2": box[3],
            "conf": conf,
            "name": names[int(cls)]
        })
    
    return response


# search similar products
@app.route('/search-product', methods=["POST"])
def search_product():
    req = request.get_json()

    image_str = req["image"]
    image_data = image_str.split(",")[1]  # remove the header of the base64 string
    image_bytes = base64.b64decode(image_data)  # decode the base64 string
    image = Image.open(io.BytesIO(image_bytes))
    
    # feature extraction
    model = tf.keras.models.load_model('similar_search/resnet50_model.keras')
    
    image = image.resize((224, 224))
    image = np.array(image)
    pre_img = preprocess_input(np.expand_dims(image, axis=0))
    result = model.predict(pre_img).flatten()
    normalized = result / norm(result)
    
    feature_vectors = np.array(pickle.load(open('similar_search/feature_vectors.pkl', 'rb')))
    db_ids = np.array(pickle.load(open('similar_search/db_ids.pkl', 'rb')))

    neighbors = NearestNeighbors(n_neighbors=min(16, len(db_ids)), algorithm='brute', metric='euclidean')
    neighbors.fit(feature_vectors)

    distances, indices = neighbors.kneighbors([normalized])

    try:
        conn = psycopg2.connect(
            host="localhost",
            database="hackonwithamazon",
            user=os.getenv("USER"),
            password=os.getenv("PASSWORD")
        )
        try:
            curs = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

            matches = []
            for id in db_ids[indices[0]]:
                curs.execute(f"SELECT * FROM products where id={id}")
                result = curs.fetchone()
                matches.append(result)

            curs.close()

            return {
                "matches": matches
            }
        except:
            return {
                "error": "Something went wrong with executing query in the database.",
                "matches": []
            }
        finally:
            conn.commit()
            conn.close()
    except:
        return {
            "error": "Something went wrong with connecting to the database.",
            "matches": []
        }


IMAGE_DIR = "database-imgs"

# get method for images
@app.route('/images/<filename>')
def get_image(filename):
    try:
        return send_from_directory(IMAGE_DIR, filename)
    except FileNotFoundError:
        return "Image not found", 404


if __name__ == '__main__':
    app.run(debug=True)




