import React from 'react';
import './styles/Home.css';
import Header from './components/Header';
import { Button, Form} from "react-bootstrap";
import {Link} from 'react-router-dom';

export default class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      username: ""
    }
  }

  handleUserNameChange(curVal) {
    this.setState({
      username: curVal
    })
  }

  render() {
    return (
      <div id="Page">
        <Header />
        <body id="Content">
          <div id="SignUpContainer">
            <h2>Welcome to UW Scribble!</h2>
            <p>
              UW scribble is a simple drawing application which allows users to messages eachother. When using the application, you are given
              an individual drawing board and a global chat where you can send and view messages from other users.
            </p>
            <form onSubmit={this.onClickPlay}>
              <Form.Group controlId="text" bsSize="large">
                <Form.Label>Username:</Form.Label>
                <Form.Control
                  autoFocus
                  type="text"

                  onChange={e => this.handleUserNameChange(e.target.value)}
                />
              </Form.Group>
              <Link to={{pathname: "gamechat",
                state:{createNewUser: this.state.username}
              }}
              >
                <Button block bsSize="large" type="submit">
                  Play!
                </Button>
              </Link>
            </form>
          </div>
        </body>
      </div>
    )
  }
}
