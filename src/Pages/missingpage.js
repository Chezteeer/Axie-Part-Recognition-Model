import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

function missingpage() {
  return(
      <div class="missingbg">
        <div class="missingpage d-flex flex-column align-items-center">
        <img src={require('../resources/axie-infinity.gif')}/>
          <p> Error 404: Page not found.</p>
          <Link to="/" style={{color: 'inherit', textDecoration: 'inherit'}}>
          <div class="missingpagebutton">
              <p> Return to home page. </p>
          </div>
          </Link>
        </div>
      </div>
  )
}

export default missingpage;
