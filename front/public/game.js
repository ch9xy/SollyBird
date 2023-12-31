const gravity = 0.28;
const speed = 3.2;
const size = [25.5, 18];
const jump = -7;


let index = 0,
  bestScore = 0,
  flight,
  flyHeight,
  currentScore,
  pipe;

// pipe settings
const pipeWidth = 78;
const pipeGap = 270;


let img = new Image();
img.src = "https://i.ibb.co/Q9yv5Jk/flappy-bird-set.png";

// general settings
let gamePlaying = false;

let pipeLoc = () =>
  Math.random() * (canvas.height - (pipeGap + pipeWidth) - pipeWidth) +
  pipeWidth;

let setup = () => {
    if(!window.gameRendered) return;
let canvas = document.getElementById("canvas");
let cTenth = canvas.width / 10;
let ctx = canvas.getContext("2d");
  currentScore = 0;
  flight = jump;

  // set initial flyHeight (middle of screen - size of the bird)
  flyHeight = canvas.height / 2 - size[1] / 2;

  // setup first 3 pipes
  pipes = Array(3)
    .fill()
    .map((a, i) => [canvas.width + i * (pipeGap + pipeWidth), pipeLoc()]);
};

let render = () => {
    if(!window.gameRendered) return;
    let canvas = document.getElementById("canvas");
let cTenth = canvas.width / 10;
let ctx = canvas.getContext("2d");
  // make the pipe and bird moving
  index++;

  // ctx.clearRect(0, 0, canvas.width, canvas.height);

  // background first part
  ctx.drawImage(
    img,
    0,
    0,
    canvas.width,
    canvas.height,
    -((index * (speed / 2)) % canvas.width) + canvas.width,
    0,
    canvas.width,
    canvas.height
  );
  // background second part
  ctx.drawImage(
    img,
    0,
    0,
    canvas.width,
    canvas.height,
    -(index * (speed / 2)) % canvas.width,
    0,
    canvas.width,
    canvas.height
  );

  // pipe display
  if (gamePlaying) {
    pipes.map((pipe) => {
      // pipe moving
      pipe[0] -= speed;

      // top pipe
      ctx.drawImage(
        img,
        432,
        588 - pipe[1],
        pipeWidth,
        pipe[1],
        pipe[0],
        0,
        pipeWidth,
        pipe[1]
      );
      // bottom pipe
      ctx.drawImage(
        img,
        432 + pipeWidth,
        108,
        pipeWidth,
        canvas.height - pipe[1] + pipeGap,
        pipe[0],
        pipe[1] + pipeGap,
        pipeWidth,
        canvas.height - pipe[1] + pipeGap
      );

      // give 1 point & create new pipe
      if (pipe[0] <= -pipeWidth) {
        currentScore++;
        // check if it's the best score
        bestScore = Math.max(bestScore, currentScore);

        // remove & create new pipe
        pipes = [
          ...pipes.slice(1),
          [pipes[pipes.length - 1][0] + pipeGap + pipeWidth, pipeLoc()],
        ];
        console.log(pipes);
      }

      // if hit the pipe, end
      if (
        [
          pipe[0] <= cTenth + size[0],
          pipe[0] + pipeWidth >= cTenth,
          pipe[1] > flyHeight || pipe[1] + pipeGap < flyHeight + size[1],
        ].every((elem) => elem)
      ) {
        console.log("Entered end of game")
       
            gamePlaying = false;
        window.gameOverScore = currentScore;
        window.gameRendered = false;
        window?.gameover && window.gameover(currentScore);
       
        
        setup();
      }
    });
  }
  // draw bird
  if (gamePlaying) {
    ctx.drawImage(
      img,
      432,
      Math.floor((index % 9) / 3) * size[1],
      ...size,
      cTenth,
      flyHeight,
      ...size
    );
    flight += gravity;
    flyHeight = Math.min(flyHeight + flight, canvas.height - size[1]);
  } else {
    ctx.drawImage(
      img,
      432,
      Math.floor((index % 9) / 3) * size[1],
      ...size,
      canvas.width / 2 - size[0] / 2,
      flyHeight,
      ...size
    );
    flyHeight = canvas.height / 2 - size[1] / 2;
    // text accueil
    ctx.fillText(`Click to play`, 85, 245);
    // ctx.fillText(`Best score : ${bestScore}`, 85, 245);
    //ctx.fillText("Click to play", 90, 535);
    ctx.font = "bold 30px courier";
  }

//   document.getElementById("bestScore").innerHTML = `Best : ${bestScore}`;
//   document.getElementById(
//     "currentScore"
//   ).innerHTML = `Current : ${currentScore}`;

  // tell the browser to perform anim
  window.requestAnimationFrame(render);
};

// launch setup
window.setup = setup;
window.renderGame = render;
window.addClickListener = () => {
    document.addEventListener("click", () => {
  if (window.gameRendered) gamePlaying = true;
});
}
// setup();
// img.onload = render;

// start game
// document.addEventListener("click", () => {
//   if (window.gameRendered) gamePlaying = true;
// });
window.onclick = () => (flight = jump);
