from flask import Flask, render_template
import os

app = Flask(__name__)

# Base directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Stop signal file
STOP_FILE = os.path.join(BASE_DIR, "stop_signal.txt")

# Violations folder
VIOLATIONS_FOLDER = os.path.join(BASE_DIR, "static", "violations")


@app.route("/")
def dashboard():

    # create violations folder if not exists
    if not os.path.exists(VIOLATIONS_FOLDER):
        os.makedirs(VIOLATIONS_FOLDER)

    images = os.listdir(VIOLATIONS_FOLDER)

    return render_template("dashboard.html", images=images)


@app.route("/violations")
def violations():

    if not os.path.exists(VIOLATIONS_FOLDER):
        os.makedirs(VIOLATIONS_FOLDER)

    images = os.listdir(VIOLATIONS_FOLDER)

    return render_template("violations.html", images=images)


@app.route("/stop")
def stop_system():

    with open(STOP_FILE, "w") as f:
        f.write("stop")

    return "<h2>🛑 SafeSight System Stopping...</h2>"


if __name__ == "__main__":
    print("🚀 SafeSight Dashboard Running")
    app.run(debug=True)