import React from 'react';
import './styles/Home.css';
import Header from './components/Header';
import CanvasDraw from "react-canvas-draw";
import { CompactPicker } from 'react-color';
import { Button, Form} from "react-bootstrap";

export default class Game extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      brushRadius: 5,
      brushColor: '#000000',
      guess: ""
    }
    this.onDrawingChange = this.onDrawingChange.bind(this);
    this.handleChangeColor = this.handleChangeColor.bind(this);
    this.onSubmitGuess = this.onSubmitGuess.bind(this);
    this.handleGuessChange = this.handleGuessChange.bind(this);
  }

  componentDidMount() {
    this.setState({
      guesser: true
    })
  }

  // TODO make requests to API to update board
  onDrawingChange() {
    localStorage.setItem(
      "savedDrawing",
      this.saveableCanvas.getSaveData()
    );
    console.log(this.saveableCanvas.getSaveData())
  }

  handleChangeColor(color) {
    this.setState({
      brushColor: color.hex
    })
  }

  handleGuessChange(e) {
    this.setState({
      guess: e.target.value
    })
  }

  onSubmitGuess() {
    console.log(this.state.guess)
    // TODO need to send the guess to backend
    this.setState({
      guess: ""
    })
  }

  drawOrGuessBoard(guesser) {
    if (guesser) {
      return (
            <div id="GuessContent">
              <h2>Your Guess?</h2>
              <input type="text" onChange={this.handleGuessChange} value={this.state.guess}/>
              <input
                type="button"
                value="Submit"
                onClick={this.onSubmitGuess}
              />
            </div>

      )
    } else {
      return (
        <div>
          <button
            onClick={() => {
              this.saveableCanvas.undo();
            }}
          >
            Undo
      </button>
          <button
            onClick={() => {
              this.saveableCanvas.clear();
            }}
          >
            Clear
      </button>
          <div>
            <label>Brush-Size: </label>
            <input
              id="BrushSize"
              type="number"
              value={this.state.brushRadius}
              onChange={e =>
                this.setState({ brushRadius: parseInt(e.target.value) })
              }
            />
          </div>
          <CompactPicker
            color={this.state.brushColor}
            onChangeComplete={(color) => this.handleChangeColor(color)}
          />
        </div>
      )
    }
  }

  render() {
    return (
      <div id="Page">
        <Header />
        <body id="Content" >
          <div id="DrawingContent">
            <div onMouseUp={this.onDrawingChange} onMouseOut={this.onDrawingChange} id="Canvas">
              <CanvasDraw
                ref={canvasDraw => (this.saveableCanvas = canvasDraw)}
                brushRadius={this.state.brushRadius}
                brushColor={this.state.brushColor}
                disabled={this.state.guesser}
              />
            </div>
            {this.drawOrGuessBoard(this.state.guesser)}
          </div>
          <div id="UsersAndScores">

          </div>
        </body>
      </div>
    )
  }
}