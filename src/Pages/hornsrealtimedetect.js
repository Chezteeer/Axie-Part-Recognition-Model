import * as tf from '@tensorflow/tfjs';
import React from "react";
import index from '../index';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
tf.setBackend('webgl');

var cardPath = '';
const weights = '/hornweights/model.json';
const [modelWeight, modelHeight] = [640, 640];
const names = [
    '5H04L-5T4R',
    'Anemone (Horn)',
    'Antenna',
    'Arco',
    'Babylonia',
    'Bamboo Shoot',
    'Beech',
    'Bumpy',
    'Cactus',
    'Candy Babylonia',
    'Caterpillars',
    'Cerastes',
    'Clamshell',
    'Cuckoo',
    'Dual Blade',
    'Eggshell',
    'Feather Spear',
    'Golden Bamboo Shoot',
    'Golden Shell',
    'Imp',
    'Incisor',
    'Kendama',
    'Kestrel',
    'Lagging',
    'Laggingggggg',
    'Leaf Bug',
    'Little Branch',
    'Merry',
    'Oranda',
    'P4R451T3',
    'Parasite',
    'Pinku Unko',
    'Pocky',
    'Rose Bud',
    "Santa's Gift",
    'Scaly Spear',
    'Scaly Spoon',
    'Shoal Star',
    'Spruce Spear',
    'Strawberry Shortcake',
    'Teal Shell',
    'Trump',
    'Umaibo',
    'Unko',
    'Watermelon',
    'Wing Horn',
    'Winter Branch',
    'Yorishiro',
    'Pliers'
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
     document.getElementById("loader-status").innerHTML = "Ready for horn scanning!";
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
      case '5H04L-5T4R':
        cardPath = index.shoalstar;
        break;
      case 'Arco':
        cardPath = index.acrobatic;
        break;
      case 'Antenna':
        cardPath = index.antenna;
        break;
      case 'Anemone (Horn)':
        cardPath = index.anemonehead;
        break;
      case 'Babylonia':
        cardPath = index.babylonia;
        break;
      case  'Bamboo Shoot':
        cardPath = index.bambooshoot;
        break;
      case 'Beech':
        cardPath = index.beech;
        break;
      case 'Bumpy':
        cardPath = index.bumpy;
        break;
      case 'Cactus':
        cardPath = index.cactus;
        break;
      case 'Candy Babylonia':
        cardPath = index.candybabylonia;
        break;
      case 'Caterpillars':
        cardPath = index.caterpillars;
        break;
      case 'Cerastes':
        cardPath = index.cerastes;
        break;
      case 'Clamshell':
        cardPath = index.clamshell;
        break;
      case 'Cuckoo':
        cardPath = index.cuckoo;
        break;
      case 'Dual Blade':
        cardPath = index.dualblade;
        break;
      case 'Eggshell':
        cardPath = index.eggshell;
        break;
      case 'Feather Spear':
        cardPath = index.featherspear;
        break;
      case 'Golden Bamboo Shoot':
        cardPath = index.goldenbambooshoot;
        break;
      case 'Golden Shell':
        cardPath = index.goldenshell;
        break;
      case 'Imp':
        cardPath = index.imp;
        break;
      case 'Incisor':
        cardPath = index.incisor;
        break;
      case 'Kestrel':
        cardPath = index.kestrel;
        break;
      case 'Kendama':
        cardPath = index.kendama;
        break;
      case 'Lagging':
        cardPath = index.lagging;
        break;
      case 'Laggingggggg':
        cardPath = index.laggingggggg;
        break;
      case 'Leaf Bug (Horn)':
        cardPath = index.leafbughorn;
        break;
      case 'Little Branch':
        cardPath = index.littlebranch;
        break;
      case 'Merry':
        cardPath = index.merry;
        break;
      case 'Oranda':
        cardPath = index.oranda;
        break;
      case 'P4R451T3':
        cardPath = index.p4r4s1t3;
        break;
      case 'Parasite':
        cardPath = index.parasite;
        break;
      case 'Pinku Unko':
        cardPath = index.pinkuunko;
        break;
      case 'Pocky':
        cardPath = index.pocky;
        break;
      case 'Rose Bud':
        cardPath = index.rosebud;
        break;
      case "Santa's Gift":
        cardPath = index.santasgift;
        break;
      case 'Scaly Spear':
        cardPath = index.scalyspear;
        break;
      case 'Scaly Spoon':
        cardPath = index.scalyspoon;
        break;
      case 'Shoal Star':
        cardPath = index.shoalstar;
        break;
      case 'Spruce Spear':
        cardPath = index.sprucespear;
        break;
      case 'Strawberry Shortcake':
        cardPath = index.strawberryshortcake;
        break;
      case 'Teal Shell':
        cardPath = index.tealshell;
        break;
      case 'Trump':
        cardPath = index.trump;
        break;
      case 'Umaibo':
        cardPath = index.umaibo;
        break;
      case 'Unko':
        cardPath = index.unko;
        break;
      case 'Watermelon':
        cardPath = index.watermelon;
        break;
      case 'Wing Horn':
        cardPath = index.winghorn;
        break;
      case 'Winter Branch':
        cardPath = index.winterbranch;
        break;
      case 'Yorishiro':
        cardPath = index.yorishiro;
        break;
      case 'Pliers':
        cardPath = index.pliers;
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
                    <Link to="/hornselect" style={{color: 'inherit', textDecoration: 'inherit'}}>
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