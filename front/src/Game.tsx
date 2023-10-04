// @ts-nocheck
import React, { useRef, useEffect, useState } from "react";

import "./css/game.css";
const FlappyBird = () => {
  useEffect(() => {
    if(window.gameRendered){
        window?.setup && window.setup();
        window?.renderGame && window.renderGame(); 
        window?.addClickListener && window.addClickListener();
    }
  }, []);

  return (
    <>
      <canvas id="canvas" width="431" height="768"></canvas>
    </>
  );
};

export default FlappyBird;
