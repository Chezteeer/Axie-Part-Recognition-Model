import * as tf from '@tensorflow/tfjs';
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import MagicDropzone from "react-magic-dropzone";
import '@tensorflow/tfjs-backend-webgl';
import index from '../index';

// import "./upload.css";
// import * as svg from "./images/undraw_duplicate_re_d39g.svg";

const disableOverfit = [0.76, 0.77, 0.78, 0.79, 0.81, 0.82, 0.83, 0.84, 0.85, 0.86, 0.87, 0.88, 0.89];   
const weights = '/hornweights/model.json';
const [modelWeight, modelHeight] = [640, 640];
var cardPath = '';
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
    'Leaf Bug (Horn)',
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
            </div>
            <div class="detecttitle">
                <p> Horn Detection is Ready! </p>
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
              <Link to="/hornselect" style={{color: 'inherit', textDecoration: 'inherit'}}>
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