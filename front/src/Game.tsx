// @ts-nocheck
import React, { useRef, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import "./css/game.css";
const FlappyBird = () => {
  const [test, setTest] = useState("Didn't change yet");
  useEffect(() => {
    window.gameRendered = true;
    window?.setup && window.setup();
    window?.render && window.render();
  }, []);

  return (
    <>
      <Helmet>
        <script src="./game.js" type="text/javascript" />
      </Helmet>

      <canvas id="canvas" width="431" height="768"></canvas>
    </>
  );
};

export default FlappyBird;
