// Daniel Shiffman
// Nature of Code: Intelligence and Learning
// https://github.com/shiffman/NOC-S18

// This flappy bird implementation is adapted from:
// https://youtu.be/cXgA1d_E-jY&

// How big is the population
let totalPopulation = 500;
// All active birds (not yet collided with pipe)
let activeBirds = [];
// All birds for any given population
let allBirds = [];
// Pipes
let pipes = [];
// A frame counter to determine when to add a pipe
let counter = 0;

let clouds = [];

// Interface elements
let speedSlider;
let speedSpan;
let highScoreSpan;
let allTimeHighScoreSpan;

// All time high score
let highScore = 0;

// Training or just showing the current best
let runBest = false;
let runBestButton;
let bestBird;
let cloudimg;
let sunimg;
let bird;
let song;


// function preload() {
//   //song = loadSound('flower.mp3');
//   cloudimg = loadImage("cloud.png");
//   sunimg = loadImage('sun.png');
//   birdimg = loadImage('bird.png');
//  }

function setup() {
  let canvas = createCanvas(600, 400);
  canvas.parent('canvascontainer');

  //song.play();

  // Access the interface elements
  speedSlider = select('#speedSlider');
  speedSpan = select('#speed');
  highScoreSpan = select('#hs');
  allTimeHighScoreSpan = select('#ahs');
  runBestButton = select('#best');
  runBestButton.mousePressed(toggleState);
  SaveButton = select('#save');
  SaveButton.mousePressed(SaveBestBird);
  LoadButton = select('#load');
  LoadButton.mousePressed(LoadBestBird);



  // Create a population
  for (let i = 0; i < totalPopulation; i++) {
    let bird = new Bird();
    activeBirds[i] = bird;
    allBirds[i] = bird;
  }

  for (let i = 0; i < 5; i++) {
    pipes.push(new Pipe());
  }
}

// Toggle the state of the simulation
function toggleState() {
  runBest = !runBest;
  // Show the best bird
  if (runBest) {
    resetGame();
    runBestButton.html('continue training');
    // Go train some more
  } else {
    nextGeneration();
    runBestButton.html('run best');
  }
}

function SaveBestBird() {
  let json = {};
  json = bestBird.brain;

  saveJSON(json, 'BridBrain.json')
}

function getdata(json) {
  let birdBrain = NeuralNetwork.deserialize(json);
  bestBird.brain = birdBrain;

  runBest = true;
  resetGame();
  runBestButton.html('continue training');
}

function LoadBestBird() {
  loadJSON('BridBrain.json', getdata);
}


function draw() {
  background(40, 30, 220)

  // Should we speed up cycles per frame
  let cycles = speedSlider.value();
  speedSpan.html(cycles);

  // image(sunimg, width - sunimg.width, 10);

  // How many times to advance the game
  for (let n = 0; n < cycles; n++) {
    // Show all the pipes
    // for (let i = pipes.length - 1; i >= 0; i--) {

    //   // pipes[i].update();

    //   // if (pipes[i].offscreen()) {
    //   //   pipes.splice(i, 1);
    //   // }
    // }
    // // Show all the cloud
    // for (let i = clouds.length - 1; i >= 0; i--) {
    //   clouds[i].update();
    //   if (clouds[i].offscreen()) {
    //     clouds.splice(i, 1);
    //   }
    // }
    // Are we just running the best bird
    if (runBest) {
      bestBird.think(pipes);
      bestBird.update();
      for (let j = 0; j < pipes.length; j++) {
        // Start over, bird hit pipe
        if (pipes[j].hits(bestBird)) {
          resetGame();
          break;
        }
      }

      if (bestBird.bottomTop()) {
        resetGame();
      }
      // Or are we running all the active birds
    } else {
      for (let i = activeBirds.length - 1; i >= 0; i--) {
        let bird = activeBirds[i];
        // Bird uses its brain!
        bird.think(pipes);
        bird.update();

        // // Check all the pipes
        for (let j = 0; j < pipes.length; j++) {
          // It's hit a pipe
          if (pipes[j].hits(activeBirds[i])) {
            // Remove this bird
            activeBirds.splice(i, 1);
            break;
          }
        }
        if ((bird.score == bird.lastscore) && bird.score > 0) {
          // activeBirds.splice(i, 1);
        } else if (bird.bottomTop()) {
          activeBirds.splice(i, 1);
        }
      }
    }

    // // Add a new pipe every so often

    // if (counter % 75 == 0) {
    //   pipes.push(new Pipe());
    // }

    // if (counter % 95 == 0) {
    //   clouds.push(new Cloud());
    // }
    counter++;
  }

  // What is highest score of the current population
  let tempHighScore = 0;
  // If we're training
  if (!runBest) {
    // Which is the best bird?
    let tempBestBird = null;
    for (let i = 0; i < activeBirds.length; i++) {
      let s = activeBirds[i].score;
      if (s > tempHighScore) {
        tempHighScore = s;
        tempBestBird = activeBirds[i];
      }
    }

    // Is it the all time high scorer?
    if (tempHighScore > highScore) {
      highScore = tempHighScore;
      bestBird = tempBestBird;
    }
  } else {
    // Just one bird, the best one so far
    tempHighScore = bestBird.score;
    if (tempHighScore > highScore) {
      highScore = tempHighScore;
    }
  }

  // Update DOM Elements
  highScoreSpan.html(tempHighScore);
  allTimeHighScoreSpan.html(highScore);

  // // Draw everything!
  // for (let i = 0; i < clouds.length; i++) {
  //   clouds[i].show();
  // }

  for (let i = 0; i < pipes.length; i++) {
    pipes[i].show();
  }

  if (runBest) {
    bestBird.show();
  } else {
    for (let i = 0; i < activeBirds.length; i++) {
      activeBirds[i].show();
    }
    // If we're out of birds go to the next generation
    if (activeBirds.length == 0) {
      nextGeneration();
    }
  }
}