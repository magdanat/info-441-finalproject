import React from 'react';
import './styles/Home.css';
import Header from './components/Header';
import CanvasDraw from "react-canvas-draw";
import { CompactPicker } from 'react-color';
import UserList from './components/UserList';
import { Button, Form } from "react-bootstrap";

export default class Game extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      brushRadius: 5,
      brushColor: '#000000',
      guess: "",
      loading: true
    }
    this.onDrawingChange = this.onDrawingChange.bind(this);
    this.handleChangeColor = this.handleChangeColor.bind(this);
    this.onSubmitGuess = this.onSubmitGuess.bind(this);
    this.handleGuessChange = this.handleGuessChange.bind(this);
  }

  componentDidMount() {
    if (this.props.location.state !== undefined) {
      if (this.props.location.state.creator === true) {

        // Create a new game
        fetch('http://localhost:80/v1/games', {
          method: 'POST',
          body: JSON.stringify({
            name: this.props.location.state.gameName,
            description: this.props.location.state.gameDesc,
            user: {
              userID: this.props.location.state.userID,
              userName: this.props.location.state.username
            }
          }),
          headers: {
            'Content-Type': 'application/json',
          }
        }).then((response) => { return response.json() })
          .then((responseJSON) => {
            this.setState({
              loading: false,
              userID: this.props.location.state.userID,
              username: this.props.location.state.username,
              gameID: responseJSON.GameID,
              gameName: responseJSON.LobbyName,
              gameDesc: responseJSON.LobbyDesc,
              maxPlayers: responseJSON.MaxPlayers,
              // number of rounds
            })
          }).catch((err) => console.log(err))

          // Add user to game and get game data
      } else if (this.props.location.state.creator === false) {
        fetch('http://localhost:80/v1/games/' + this.props.location.state.gameID + '/players', {
          method: 'POST',
          body: JSON.stringify({
            id: this.props.location.state.userID
          }),
          headers: {
            'Content-Type': 'application/json',
          }
        }).then((response) => {
          fetch('http://localhost:80/v1/games/' + this.props.location.state.gameID, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          }).then((response) => { return response.json() })
            .then((responseJSON) => {
              this.setState({
                loading: false,
                userID: this.props.location.state.userID,
                username: this.props.location.state.username,
                gameID: responseJSON.GameID,
                gameName: responseJSON.LobbyName,
                gameDesc: responseJSON.LobbyDesc,
                maxPlayers: responseJSON.MaxPlayers,
                // number of rounds
              })
              console.log(responseJSON)
            }).catch((err) => console.log(err))
        })
          .catch((err) => console.log(err))
      }
    } else {
      this.setState({ loading: false })
    }

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
          <input type="text" onChange={this.handleGuessChange} value={this.state.guess} />
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
              <UserList gameID={this.props.location.state.gameID}/>
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
            </div>
          </body>
        </div>
      )
    }
  }
}