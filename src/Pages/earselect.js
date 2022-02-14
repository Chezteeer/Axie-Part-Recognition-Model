import React from 'react';
import './eyeselect';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

function eyeselect() {
  return (
    <>
      <div class="bg-image">
                <div class="navibar">
                    <div class="row container-fluid">
                        <img class="mainlogo" src={require('../resources/logo.png')} alt="logo"/>
                        <div>
                            <p class="h3"> Axie Part Recognition Model </p>
                        </div>
                    </div>   
                </div>
                <div>
                    <div class="d-flex justify-content-center">
                        <p> Please choose a type of detection for ears.</p>
                    </div>
                    <div class="row justify-content-center">
                    <Link to="/earimagedetect" style={{color: 'inherit', textDecoration: 'inherit'}}>
                        <div class="imagebutton">
                            <p> Upload a Picture! </p>
                        </div>
                    </Link>
                    </div>
                    <div class="row justify-content-center">
                    <Link to="/earrealtimedetect" style={{color: 'inherit', textDecoration: 'inherit'}}>
                        <div class="realtimebutton">
                            <p> Realtime Detection! </p>
                        </div>
                    </Link>
                    </div>
                    <div class="row justify-content-center">
                    <Link to="/" style={{color: 'inherit', textDecoration: 'inherit'}}>
                        <div class="backbutton">
                            <p> Go back! </p>
                        </div>
                    </Link>
                    </div>
                </div>
            </div>
    </>
  )
}

export default eyeselect;
