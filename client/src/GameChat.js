import React from 'react';
import './styles/Home.css';
import Header from './components/Header';
import CanvasDraw from "react-canvas-draw";
import { CompactPicker } from 'react-color';
import Chat from './components/Chat';
import { Button, Form } from "react-bootstrap";

export default class GameChat extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      brushRadius: 5,
      brushColor: '#000000',
      guess: "",
      loading: true
    }
    this.handleChangeColor = this.handleChangeColor.bind(this);
  }

  componentDidMount() {
    if (this.props.location.state != undefined) {
      if (this.props.location.state.createNewUser != undefined) {
        fetch('https://fpapi.nathanmagdalera.me:443/v1/users', {
          method: 'POST',
          body: JSON.stringify({ UserName: this.props.location.state.createNewUser }),
          headers: {
            'Content-Type': 'application/json',
          }
        }).then((response) => { return response.json() })
          .then((responseJSON) => {
            console.log(responseJSON)
            this.setState({
              username: this.props.location.state.createNewUser,
              userID: responseJSON.id,
              loading: false
            })
          })
      } else {
        this.setState({ loading: false })
      }
    } else {
      this.setState({ loading: false })
    }
    this.setState({
      guesser: false
    })
  }

  handleChangeColor(color) {
    this.setState({
      brushColor: color.hex
    })
  }
 
  drawBoard() {
    return (
      <div>
        <button
          onClick={() => {
            localStorage.setItem(
              "savedDrawing",
              this.saveableCanvas.getSaveData()
            );
          }}
        >
          Save
          </button>
        <button
          onClick={() => {
            this.saveableCanvas.loadSaveData(
              localStorage.getItem("savedDrawing")
            );
          }}
          style={{marginRight: '30px'}}
        >
          Load
        </button>
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


  render() {
    if (this.state.loading) {
      return (
        <div id="Page">
          <Header />
          <body id="Content">
            <h1 style={{ color: 'red', fontSize: '50px' }}>Loading...</h1>
          </body>

        </div>
      )
    } else {
      return (
        <div id="Page">
          <Header />
          <body id="Content" >
            <div id="GamePage">
              <Chat userID={this.state.userID} username={this.props.location.state.createNewUser} />
              <div id="DrawingContent">
                <div id="Canvas">
                  <CanvasDraw
                    ref={canvasDraw => (this.saveableCanvas = canvasDraw)}
                    brushRadius={this.state.brushRadius}
                    brushColor={this.state.brushColor}
                    disabled={this.state.guesser}
                  />
                </div>
                {this.drawBoard()}
              </div>
            </div>
          </body>
        </div>
      )
    }
  }
}