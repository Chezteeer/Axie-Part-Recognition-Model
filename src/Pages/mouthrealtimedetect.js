import * as tf from '@tensorflow/tfjs';
import React from "react";
import index from '../index';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
tf.setBackend('webgl');

var cardPath = '';
const weights = '/uploadmouth/model.json';
const [modelWeight, modelHeight] = [640, 640];
const names = [
    'Axie Kiss',
    'Catfish',
    'Confident',
    'Cute Bunny',
    'Dango',
    'Doubletalk',
    'Feasting Mosquito',
    'Geisha',
    'Goda',
    'Herbivore',
    'Humorless',
    'Hungry Bird',
    'Kawaii',
    'Kotaro',
    'Lam',
    'Lam Handsome',
    'Little Owl',
    'Mosquito',
    'Mr. Doubletalk',
    'Nut Cracker (Mouth)',
    'Peace Maker',
    'Pincer',
    'Piranha',
    'Razor Bite',
    'Risky Fish',
    'Rudolph',
    'Serious',
    'Silence Whisper',
    'Skull Cracker',
    'Square Teeth',
    'Tiny Carrot',
    'Tiny Turtle',
    'Toothless Bite',
    'Zigzag'
];
    const colors = ['#FFDE80', '#66FF80', '#FF6584', '#FFDE80', '#66FF80', '#FF6584', '#FFDE80', '#66FF80', '#FF6584',
    '#FFDE80', '#66FF80', '#FF6584', '#FFDE80', '#66FF80', '#FF6584', '#FFDE80', '#66FF80', '#FF6584',
    '#FFDE80', '#66FF80', '#FF6584', '#FFDE80', '#66FF80', '#FF6584', '#FFDE80', '#66FF80', '#FF6584',
    '#FFDE80', '#66FF80', '#FF6584', '#FFDE80', '#66FF80', '#FF6584', '#FFDE80', '#66FF80', '#FF6584',
    '#FFDE80', '#66FF80', '#FF6584', '#FFDE80', '#66FF80', '#FF6584', '#FFDE80', '#66FF80', '#FF6584',
    '#FFDE80', '#66FF80', '#FF6584', '#FFDE80'];


class RealtimeApp extends React.Component {
  state = {
    model: null,
    preview: "",
    predictions: []
  }

  videoRef = React.createRef();
  canvasRef = React.createRef();
  myStream = null;

  constructor(props) { // Sets State
    super(props);
    this.state = {
      oldPart: 'No detections yet.'
    };
  }

  componentDidMount() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const webCamPromise = navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            facingMode: "user",
            width: "640",
            height: "480"
          }
        })
        .then(stream => {
          window.stream = stream;
          this.myStream = stream;
          this.videoRef.current.srcObject = stream;
          return new Promise((resolve, reject) => {
            this.videoRef.current.onloadedmetadata = () => {
              resolve();
            };
          });
        })
        .catch(error => {
          console.log('error', error);
        });

      const modelPromise = tf.loadGraphModel(weights);
      Promise.all([modelPromise, webCamPromise])
        .then(values => {
          this.detectFrame(this.videoRef.current, values[0]);
        })
        .catch(error => {
          console.error(error);
        });
    }
  }


  componentWillUnmount() {
    const tracks = this.myStream.getTracks();

    tracks.forEach(function (track) {
      track.stop();
    });
  }

  detectFrame = (video, model) => {
    tf.engine().startScope();
    const input = tf.tidy(() => {
      return tf.image.resizeBilinear(tf.browser.fromPixels(video), [modelWeight, modelHeight])
        .div(255.0).expandDims(0);
    });

    model.executeAsync(input)
      .then(predictions => {
        this.renderPredictions(predictions, video);
        requestAnimationFrame(() => {
          this.detectFrame(video, model);
        });
        tf.engine().endScope();
      });
  };

  renderPredictions = predictions => {
     document.getElementById("rt-loader").style.display = "none";
     document.getElementById("loader-status").innerHTML = "Ready for mouth scanning!";
    var c = document.getElementById('frame');
    if (this.canvasRef != null && this.canvasRef.current != null) {
      const ctx = this.canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // Font options.
      const font = "16px Fredoka One";
      ctx.font = font;
      ctx.textBaseline = "top";

      //Getting predictions
      const [boxes, scores, classes, valid_detections] = predictions;
      const boxes_data = boxes.dataSync();
      const scores_data = scores.dataSync();
      const classes_data = classes.dataSync();
      const valid_detections_data = valid_detections.dataSync()[0];

      tf.dispose(predictions);

      var i;
      const textHeight = parseInt(font, 10);
      for (i = 0; i < valid_detections_data; ++i) {
        let [x1, y1, x2, y2] = boxes_data.slice(i * 4, (i + 1) * 4);
        x1 *= c.width;
        x2 *= c.width;
        y1 *= c.height;
        y2 *= c.height;
        const width = x2 - x1;
        const height = y2 - y1;
        const klass = names[classes_data[i]];
        const score = scores_data[i].toFixed(2);

        // Draw the bounding box.
        ctx.strokeStyle = colors[classes_data[i]];
        ctx.lineWidth = 4;
        ctx.strokeRect(x1, y1, width, height);

        // Draw the label background.
        ctx.fillStyle = colors[classes_data[i]];
        const textWidth = ctx.measureText(klass + ": " + score).width;
        // const textHeight = parseInt(font, 10); // base 10
        ctx.fillRect(x1-2, y1-textHeight-4, textWidth + 4, textHeight + 4);
      }
      for (i = 0; i < valid_detections_data; ++i) {
        let [x1, y1, ,] = boxes_data.slice(i * 4, (i + 1) * 4);
        x1 *= c.width;
        y1 *= c.height;
        const klass = names[classes_data[i]];
        const score = scores_data[i].toFixed(2);

        // Draw the text last to ensure it's on top.
        ctx.fillStyle = "#2f2e41";
        ctx.fillText(klass + ": " + score, x1, y1 - textHeight);

        // Sets the detected part
        this.setState({ oldPart: klass });
      }
    }
  };

  initCardPath () {
    switch (this.state.oldPart) {
      case 'Axie Kiss':
        cardPath = index.axiekiss;
        break;
      case 'Catfish':
        cardPath = index.catfish;
        break;
      case 'Confident':
        cardPath = index.confident;
        break;
      case 'Dango':
        cardPath = index.dango;
        break;
      case 'Doubletalk':
        cardPath = index.doubletalk;
        break;
      case 'Feasting Mosquito':
        cardPath = index.feastingmosquito;
        break;
      case 'Geisha':
        cardPath = index.geisha;
        break;
      case 'Herbivore':
        cardPath = index.herbivore;
        break;
      case 'Humorless':
        cardPath = index.humorless;
        break;
      case 'Hungry Bird':
        cardPath = index.hungrybird;
        break;
      case 'Kawaii':
        cardPath = index.kawaii;
        break;
      case 'Kotaro':
        cardPath = index.kotaro;
        break;
      case 'Lam':
        cardPath = index.lam;
        break;
      case 'Lam Handsome':
        cardPath = index.lamhandsome;
        break;
      case 'Little Owl':
        cardPath = index.littleowl;
        break;
      case 'Mosquito':
        cardPath = index.mosquito;
        break;
      case 'Mr. Doubletalk':
        cardPath = index.mrdoubletalk;
        break;
      case 'Nut Cracker (Mouth)':
        cardPath = index.nutcrackermouth;
        break;
      case 'Peace Maker':
        cardPath = index.peacemaker;
        break;
      case 'Pincer':
        cardPath = index.pincer;
        break;
      case 'Piranha':
        cardPath = index.piranha;
        break;
      case 'Razor Bite':
        cardPath = index.razorbite;
        break;
      case 'Risky Fish':
        cardPath = index.riskyfish;
        break;
      case 'Rudolph':
        cardPath = index.rudolph;
        break;
      case 'Serious':
        cardPath = index.serious;
        break;
      case 'Silence Whisper':
        cardPath = index.silencewhisper;
        break;
      case 'Skull Cracker':
        cardPath = index.skullcracker;
        break;
      case 'Square Teeth':
        cardPath = index.squareteeth;
        break;
      case 'Tiny Carrot':
        cardPath = index.tinycarrot;
        break;
      case 'Tiny Turtle':
        cardPath = index.tinyturtle;
        break;
      case 'Toothless Bite':
        cardPath = index.toothlessbite;
        break;
      case 'Zigzag':
        cardPath = index.zigzag;
        break;
      default:
        cardPath = index.unknowncard;
    };
  }

  render() {
    return (
      <>
        {this.initCardPath()}
        <div class="bg-image">
            <div class="navibar">
                <div class="row container-fluid">
                   <img class="mainlogo" src={require('../resources/logo.png')} alt="logo"/>
                        <div>
                            <p class="h3"> Axie Part Recognition Model </p>
                        </div>
                </div>
                <div className="d-flex flex-column align-items-center">
                  <div className="d-inline-flex flex-row">
                    <p className="text-center subtitle" id="loader-status">Loading model...</p>
                  <div className="lds-ellipsis" id="rt-loader"><div></div><div></div><div></div><div></div></div>
                </div>
                <div class="d-flex flex-row">
                  <div className="d-flex flex-row justify-content-center align-items-start realtimecanvas">
                      <video
                        className="mx-auto z-index-1 position-relative"
                       autoPlay
                       playsInline
                        muted
                        ref={this.videoRef}
                        width="640"
                        height="480" 
                        id="frame"          
                     />
                     <canvas
                       className="mx-auto z-index-2 d-flex align-self-center position-absolute"
                        ref={this.canvasRef}
                        width="640"
                        height="480"
                     />
                  </div>
                  <div class="col">
                    <div class="realtimedivpart">
                      <p> Last Detected Part: {this.state.oldPart} </p>
                    </div>
                    <div class="realtimecardcontainer">
                       <p> Card associated with the Part: </p>
                       <img class="axiecard" src={cardPath} alt="detectedcard"/>
                    </div>
                  </div>
                  </div>
                  <div class="d-flex flex-row">
                    <div class="realtimeinstruction">
                        <p> Instructions: Show an axie to the camera to automatically detect the selected part.</p>
                    </div>
                    <Link to="/mouthselect" style={{color: 'inherit', textDecoration: 'inherit'}}>
                    <div class="realtimeprevious">
                        <p> Go back? </p>
                    </div>
                    </Link>
                  </div>
              </div>
            </div>
        </div>
      </>
    );
  }
}

export default RealtimeApp;