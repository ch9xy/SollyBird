// @ts-nocheck
import React, { useRef, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import "./css/game.css";
const FlappyBird = () => {
  useEffect(() => {
    window.gameRendered = true;
  }, []);

  return (
    <>
      <Helmet>
        <script src="./game.js" type="text/javascript" />
      </Helmet>
      <h1>Solly Bird</h1>
      <div className="score-container">
        <div id="bestScore"></div>
        <div id="currentScore"></div>
      </div>

      <canvas id="canvas" width="431" height="768"></canvas>
    </>
  );
};

export default FlappyBird;
