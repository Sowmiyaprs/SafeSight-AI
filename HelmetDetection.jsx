import React, { useRef, useEffect } from "react";
import Webcam from "react-webcam";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

export default function HelmetDetection() {

  const webcamRef = useRef(null);

  useEffect(() => {
    loadModel();
  }, []);

  const loadModel = async () => {

    const model = await cocoSsd.load();

    setInterval(async () => {

      if (
        webcamRef.current &&
        webcamRef.current.video.readyState === 4
      ) {

        const video = webcamRef.current.video;

        const predictions = await model.detect(video);

        predictions.forEach((prediction) => {

          if (prediction.class === "person") {

            console.log("⚠ No Helmet Detected");

            playAlarm();
            sendViolation();

          }

        });

      }

    }, 2000);

  };

  const playAlarm = () => {

    const audio = new Audio("/alarm.mp3");
    audio.play();

  };

  const sendViolation = async () => {

    await fetch("/api/violation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        violation_type: "NO_HELMET",
        location: "Factory Gate",
        severity: "HIGH"
      })
    });

  };

  return (

    <div>

      <h2>Live Helmet Detection</h2>

      <Webcam
        ref={webcamRef}
        style={{ width: "600px", borderRadius: "10px" }}
      />

    </div>

  );
}