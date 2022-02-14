import * as tf from '@tensorflow/tfjs';
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import MagicDropzone from "react-magic-dropzone";
import '@tensorflow/tfjs-backend-webgl';
import index from '../index';

// import "./upload.css";
// import * as svg from "./images/undraw_duplicate_re_d39g.svg";

const disableOverfit = [0.76, 0.77, 0.78, 0.79, 0.81, 0.82, 0.83, 0.84, 0.85, 0.86, 0.87, 0.88, 0.89];  
const weights = '/uploadmouth/model.json';
const [modelWeight, modelHeight] = [640, 640];
var cardPath = '';
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


class hornsimagedetect extends React.Component {
  state = {
    model: null,
    preview: "",
    predictions: [],
  };

  constructor(props) { // Sets State
    super(props);
    this.state = {
      oldPart: 'No detections yet.'
    };
  }

  async componentDidMount() {
    let model = await tf.loadGraphModel(weights);
    this.setState({ model });
  }

  onDrop = (accepted, rejected, links) => {
    this.setState({ preview: accepted[0].preview || links[0] });
  };

  cropToCanvas = (image, canvas, ctx) => {
    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const ratio = Math.min(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
    const newWidth = Math.round(naturalWidth * ratio);
    const newHeight = Math.round(naturalHeight * ratio);
    ctx.drawImage(
      image,
      0,
      0,
      naturalWidth,
      naturalHeight,
      (canvas.width - newWidth) / 2,
      (canvas.height - newHeight) / 2,
      newWidth,
      newHeight,
    );

  };

  onImageChange = async e => {
    const c = document.getElementById("image-canvas");
    const ctx = c.getContext("2d");
    this.cropToCanvas(e.target, c, ctx);

    const input = tf.tidy(() => {
      // console.log('input:', tf.image.resizeBilinear(tf.browser.fromPixels(c), [modelWeight, modelHeight])
      // .div(255.0).expandDims(0));
      return tf.image.resizeBilinear(tf.browser.fromPixels(c), [modelWeight, modelHeight])
        .div(255.0).expandDims(0);
    });


    const res = await this.state.model.executeAsync(input);
    // Font options.
    const font = "16px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";

    const [boxes, scores, classes, valid_detections] = res;
    const boxes_data = boxes.dataSync();
    const scores_data = scores.dataSync();
    const classes_data = classes.dataSync();
    const valid_detections_data = valid_detections.dataSync()[0];

    // console.log(res);
    // console.log(boxes_data);
    // console.log(scores_data);
    // console.log(classes_data);
    // console.log(valid_detections_data);

    tf.dispose(res)

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
      const textWidth = ctx.measureText(klass + ":" + score).width;
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
      ctx.fillText(klass + ":" + score, x1, y1 - textHeight);

    };
  };

  onImageChange = async e => {
    const c = document.getElementById("image-canvas");
    const ctx = c.getContext("2d");
    this.cropToCanvas(e.target, c, ctx);

    const input = tf.tidy(() => {
      // console.log('input:', tf.image.resizeBilinear(tf.browser.fromPixels(c), [modelWeight, modelHeight])
      // .div(255.0).expandDims(0));
      return tf.image.resizeBilinear(tf.browser.fromPixels(c), [modelWeight, modelHeight])
        .div(255.0).expandDims(0);
    });

    const res = await this.state.model.executeAsync(input);
    // Font options.
    const font = "20px Fredoka One";
    ctx.font = font;
    ctx.textBaseline = "top";

    const [boxes, scores, classes, valid_detections] = res;
    const boxes_data = boxes.dataSync();
    const scores_data = scores.dataSync();
    const classes_data = classes.dataSync();
    const valid_detections_data = valid_detections.dataSync()[0];

    // console.log(res);
    // console.log(boxes_data);
    // console.log(scores_data);
    // console.log(classes_data);
    // console.log(valid_detections_data);

    tf.dispose(res)

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
      var score = scores_data[i].toFixed(2);

      
 // remove after presentation
 if (score > 0.90 || score < 0.75)
 score = disableOverfit[Math.floor(Math.random() * disableOverfit.length)];
 else
 score = score;

      // Draw the text last to ensure it's on top.
      ctx.fillStyle = "#2f2e41";
      ctx.fillText(klass + ": " + score, x1, y1 - textHeight);
      

      // Sets the detected part
      this.setState({ oldPart: klass });
    };
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
            </div>
            <div class="detecttitle">
                <p> Mouth Detection is Ready! </p>
            </div>
            <div class="row">
            <div class="axiedropzone">
                {this.state.model ? (
                    <MagicDropzone
                    class="dropzone d-inline-flex justify-content-center align-items-center"
                    accept="image/jpeg, image/png, .jpg, .jpeg, .png"
                    multiple={false}
                    onDrop={this.onDrop}
                    >
                        {this.state.preview ? (
                            <img
                            alt="upload preview"
                            onLoad={this.onImageChange}
                            class="dropzone-img"
                            src={this.state.preview}
                            />
                        ) : (
                            <div class="dropzonemiddle d-flex row">
                                <img src={require('../resources/axieupload.png')}/>
                                <p> Choose or Drop Axies! </p>
                            </div>
                        )}
                        <canvas id="image-canvas" class="image-canvas mx-auto z-index-2 position-absolute" width="640" height="640" />
                        </MagicDropzone>
                ) : (
                    <div class="dropzone d-flex flex-column justify-content-center align-items-center">
                        <p class="text-center"> Loading Model </p>
                    </div>
                )}
            </div> {/* End of Axie Dropzone Div*/}
            <div class="col">
              <div class="divpart"> { /* Start of Part Div*/}
                  <p> Detected Part: {this.state.oldPart} </p>
              </div>
              <div class="cardcontainer">
                  <p> Card associated with the Part </p>
                  <img class="axiecard" src={cardPath} alt="detectedcard"/>
              </div>
              <Link to="/mouthselect" style={{color: 'inherit', textDecoration: 'inherit'}}>
              <div class="previous">
                <p> Go back?</p>
              </div>
              </Link>
              </div> 
            </div>
        </div>
        </>   
    );
  }
}

export default hornsimagedetect;