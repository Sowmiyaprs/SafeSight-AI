from flask import Flask, render_template, Response, jsonify
import cv2
import os

app = Flask(
    __name__,
    template_folder="../templates",
    static_folder="../static"
)

camera = cv2.VideoCapture(0)

helmet_count = 0
nohelmet_count = 0


def generate_frames():
    global helmet_count, nohelmet_count

    while True:
        success, frame = camera.read()

        if not success:
            break
        else:
            # Temporary AI logic
            helmet_count += 1

            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()

            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')


@app.route('/')
def dashboard():
    return render_template("dashboard.html")


@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/stats')
def stats():
    return jsonify({
        "helmet": helmet_count,
        "nohelmet": nohelmet_count
    })


if __name__ == "__main__":
    app.run(debug=True)