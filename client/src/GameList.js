import React from 'react';
import './styles/Home.css';
import Header from './components/Header';
import { Button, Form} from "react-bootstrap";
import {Link} from 'react-router-dom';

export default class GameList extends React.Component {
  constructor(props) {
    super(props)
    if(this)
    this.state ={
      create: false,
      loading: true
    }
    this.gameListOrCreate = this.gameListOrCreate.bind(this);
    this.setState = this.setState.bind(this)
  }

  componentDidMount() {
    if(this.props.location.state != undefined) {
      if(this.props.location.state.createNewUser != undefined) {
        fetch('http://localhost:80/v1/users', {
          method: 'POST',  
          body: JSON.stringify({username: this.props.location.state.createNewUser}),  
          headers:{
            'Content-Type': 'application/json',
          }
        }).then((response) => {return response.json()})
        .then((responseJSON) => {
          this.setState({
            username: this.props.location.state.createNewUser,
            userID: responseJSON.insertId,
            loading: false
          })
        })
      } else {
        this.setState({loading:false})
      }
    } else {
      this.setState({loading:false})
    }
  }

  gameListOrCreate() {
    if(this.state.create) {
      return (
        <div id="GameCreatorContainer">
        <h1>Create a New Game</h1>
          <div id="GameCreatorContent">
          <form onSubmit={this.onClickPlay}>
              <Form.Group controlId="email" bsSize="large">
                <Form.Label>Game Name:</Form.Label>
                <Form.Control
                  autoFocus
                  type="text"

                  onChange={e => this.setState({gameName: e.target.value})}
                />
              </Form.Group>
              <Form.Group controlId="email" bsSize="large">
                <Form.Label>Game Description:</Form.Label>
                <Form.Control
                  autoFocus
                  type="text"

                  onChange={e => this.setState({gameDesc: e.target.value})}
                />
              </Form.Group>
              <Button block bsSize="large" type="submit" onClick={() => this.setState({create: false})}>
                  Back
              </Button>
              <Link to="game">
                <Button block bsSize="large" type="submit">
                  Create Game
                </Button>
              </Link>
            </form>
          </div>
        </div>
      )
    } else {
      return(
        <div id="GameListContainer">
          <div id="GameListHeader">
            <h1>List of Active Games</h1>
            <Button id="NewGameButton" bsSize="large" type="submit" onClick={() => this.setState({create: true})}>
              New Game
            </Button>
          </div>
          <div id="ScrollingGameList">
            <h1>jdksjd</h1>

            <h1>jdksjd</h1>
            <h1>jdksjd</h1>
            <h1>jdksjd</h1>
            <h1>jdksjd</h1>
            <h1>jdksjd</h1>
            <h1>jdksjd</h1>
            <h1>jdksjd</h1>
            <h1>jdksjd</h1>
            <h1>jdksjd</h1>
            <h1>jdksjd</h1>
            <h1>jdksjd</h1>
            <h1>jdksjd</h1>
            <h1>jdksjd</h1>
            <h1>jdksjd</h1>
            <h1>jdksjd</h1>
            <h1>jdksjd</h1>
            <h1>jdksjd</h1>
            <h1>jdksjd</h1>
            <h1>jdksjd</h1>
            <h1>jdksjd</h1>
            <h1>jdksjd1</h1>

          </div>
        </div>
      )
    }
  }

  render() {
    if(this.state.loading) {
      return(
        <div id="Page">
        <Header/>
        <body id="Content">
          <h1 style={{color:'red', fontSize: '50px'}}>Loading...</h1>
        </body>

      </div>
      )
    } else {
      return (
        <div id="Page">
          <Header/>
          <body id="Content">
            {this.gameListOrCreate()}
          </body>
  
        </div>
      )
    }
  }
}