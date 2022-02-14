// Libraries
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// CSS
import './styles.css';

// Part Icons
import EyesIcon from '../resources/eyes.svg';
import BackIcon from '../resources/back.svg';
import EarsIcon from '../resources/ears.svg';
import HornsIcon from '../resources/horns.svg';
import MouthIcon from '../resources/mouth.svg';
import TailIcon from '../resources/tail.svg';

function partselect() {
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
                        <p> Select the part you want to detect.</p>
                    </div>
                    <div class="row justify-content-center">
                        <Link to="/eyeselect" style={{color: 'inherit', textDecoration: 'inherit'}}>
                        <div class="partbutton">
                            <img class="particon" src={EyesIcon}/>
                            <p> Eyes </p>
                        </div>
                        </Link>
                        <Link to="/backselect" style={{color: 'inherit', textDecoration: 'inherit'}}>
                        <div class="partbutton">
                            <img class="particon" src={BackIcon}/>
                            <p> Back</p>
                        </div>
                        </Link>
                        <Link to="/earselect" style={{color: 'inherit', textDecoration: 'inherit'}}>
                        <div class="partbutton">
                            <img class="particon" src={EarsIcon}/>
                            <p>  Ears</p>
                        </div>
                        </Link>
                    </div>
                    <div class="row justify-content-center">
                        <Link to="/hornselect" style={{color: 'inherit', textDecoration: 'inherit'}}>
                        <div class="partbutton">
                            <img class="particon" src={HornsIcon}/>
                            <p> Horns</p>
                        </div>
                        </Link>
                        <Link to="/mouthselect" style={{color: 'inherit', textDecoration: 'inherit'}}>
                        <div class="partbutton">
                            <img class="particon" src={MouthIcon}/>
                            <p> Mouth </p>
                        </div>
                        </Link>
                        <Link to="/tailselect" style={{color: 'inherit', textDecoration: 'inherit'}}>
                        <div class="partbutton">
                            <img class="particon" src={TailIcon}/>
                            <p> Tail </p>
                        </div>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}

export default partselect;