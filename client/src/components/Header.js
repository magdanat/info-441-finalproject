import React from 'react';
import '../styles/Home.css';
import UWLogo from "../assets/uw_logo.png";

export default class Header extends React.Component {
  render() {
    return (
      <div id="Header">
          
          <h1>U</h1>
          <img src={UWLogo} /> 
          <h1>Scribble</h1>
      </div>
    )
  }
}