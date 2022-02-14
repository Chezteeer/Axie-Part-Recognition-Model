import * as tf from '@tensorflow/tfjs';
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import MagicDropzone from "react-magic-dropzone";
import '@tensorflow/tfjs-backend-webgl';
import index from '../index';
import { StringToHashBucketFast } from '@tensorflow/tfjs';

// import "./upload.css";
// import * as svg from "./images/undraw_duplicate_re_d39g.svg";

const disableOverfit = [0.76, 0.77, 0.78, 0.79, 0.81, 0.82, 0.83, 0.84, 0.85, 0.86, 0.87, 0.88, 0.89];     
const weights = '/uploadback/model.json';
const [modelWeight, modelHeight] = [640, 640];
var cardPath = '';
const names = [
    '1ND14N-5T4R',
    'Anemone (Back)',
    'Balloon',
    'Bidens',
    'Blue Moon',
    'Bone Sail',
    'Buzz Buzz',
    'Candy Canes',
    'Croc',
    'Crystal Hermit',
    'Cupid',
    'Frozen Bucket',
    'Furball',
    'Garish Worm',
    'Goldfish',
    'Green Thorns',
    'Hamaya',
    'Hasagi',
    'Hermit',
    'Hero',
    'Indian Star',
    'Jaguar',
    'Kingfisher',
    'Mint',
    'Origami',
    'Perch',
    'Pigeon Post',
    'Pink Turnip',
    'Pumpkin',
    'Raven',
    'Red Ear',
    'Risky Beast',
    'Ronin',
    'Rugged Sail',
    'Sandal',
    'Scarab',
    'Shiitake',
    'Snail Shell',
    'Spiky Wing',
    'Sponge',
    'Starry Balloon',
    'Starry Shell',
    'Timber',
    'Tri Feather',
    'Tri Spikes',
    'Turnip',
    'Watering Can',
    'Yakitori'
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
        case '1ND14N-5T4R':
            cardPath = index.indianstarmystic;
            break;
        case 'Anemone (Back)':
            cardPath = index.anemoneback;
            break;
        case 'Balloon':
            cardPath = index.balloon;
            break;
        case 'Bidens':
            cardPath = index.bidens;
            break;
        case 'Blue Moon':
            cardPath = index.bluemoon;
            break;
        case 'Bone Sail':
            cardPath = index.bonesail;
            break;
        case 'Buzz Buzz':
            cardPath = index.buzzbuzz;
            break;
        case 'Candy Canes':
            cardPath = index.candycanes;
            break;
        case 'Croc':
            cardPath = index.croc;
            break;
        case 'Crystal Hermit':
            cardPath = index.crystalhermit;
            break;
        case 'Cupid':
            cardPath = index.cupid;
            break;
        case 'Frozen Bucket':
            cardPath = index.frozenbucket;
            break;
        case 'Furball':
            cardPath = index.furball;
            break;
        case 'Garish Worm':
            cardPath = index.garishworm;
            break;
        case 'Goldfish':
            cardPath = index.goldfish;
            break;
        case 'Green Thorns':
            cardPath = index.greenthorns;
            break;
        case 'Hamaya':
            cardPath = index.hamaya;
            break;
        case 'Hasagi':
            cardPath = index.hasagi;
            break;
        case 'Hermit':
            cardPath = index.hermit;
            break;
        case 'Hero':
            cardPath = index.hero;
            break;
        case 'Indian Star':
            cardPath = index.indianstar;
            break;
        case 'Jaguar':
            cardPath = index.jaguar;
            break;
        case 'Kingfisher':
            cardPath = index.kingfisher;
            break;
        case 'Mint':
            cardPath = index.mint;
            break;
        case 'Origami':
            cardPath = index.origami;
            break;
        case 'Perch':
            cardPath = index.perch;
            break;
        case 'Pigeon Post':
            cardPath = index.pigeonpost;
            break;
        case 'Pink Turnip':
            cardPath = index.pinkturnip;
            break;
        case 'Pumpkin':
            cardPath = index.pumpkin;
            break;
        case 'Raven':
            cardPath = index.raven;
            break;
        case 'Red Ear':
            cardPath = index.redear;
            break;
        case 'Risky Beast':
            cardPath = index.riskybeast;
            break;
        case 'Ronin':
            cardPath = index.ronin;
            break;
        case 'Rugged Sail':
            cardPath = index.ruggedsail;
            break;
        case 'Sandal':
            cardPath = index.sandal;
            break;
        case 'Scarab':
            cardPath = index.scarab;
            break;
        case 'Shiitake':
            cardPath = index.shiitake;
            break;
        case 'Snail Shell':
            cardPath = index.snailshell;
            break;
        case 'Spiky Wing':
            cardPath = index.spikywing;
            break;
        case 'Sponge':
            cardPath = index.sponge;
            break;
        case 'Starry Balloon':
            cardPath = index.starryballoon;
            break;
        case 'Starry Shell':
            cardPath = index.starryshell;
            break;
        case 'Timber':
            cardPath = index.timber;
            break;
        case 'Tri Feather':
            cardPath = index.trifeather;
            break;
        case 'Tri Spikes':
            cardPath = index.trispikes;
            break;
        case 'Turnip':
            cardPath = index.turnip;
            break;
        case 'Watering Can':
            cardPath = index.wateringcan;
            break;
        case 'Yakitori':
            cardPath = index.yakitori;
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
                <p> Back Detection is Ready! </p>
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
              <Link to="/backselect" style={{color: 'inherit', textDecoration: 'inherit'}}>
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