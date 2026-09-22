from flask import Flask, jsonify, send_from_directory
import os

app = Flask(__name__)

VIOLATIONS_FOLDER = "../violations"

@app.route("/violations")
def get_violations():

    files = os.listdir(VIOLATIONS_FOLDER)
    images = [f for f in files if f.endswith(".jpg")]

    return jsonify(images)


@app.route("/evidence/<filename>")
def get_image(filename):

    return send_from_directory(VIOLATIONS_FOLDER, filename)


if __name__ == "__main__":
    app.run(port=5000, debug=True)