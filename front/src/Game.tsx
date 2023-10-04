// @ts-nocheck
import React, { useRef, useEffect, useState } from "react";

import "./css/game.css";
const FlappyBird = () => {
  useEffect(() => {
    console.log("Entered")
    if(window.gameRendered){
        window?.setup && window.setup();
   window?.renderGame && window.renderGame(); }
  }, []);

  return (
    <>
      <h1>Solly Bird</h1> 
      <canvas id="canvas" width="431" height="768"></canvas>
    </>
  );
};

export default FlappyBird;
