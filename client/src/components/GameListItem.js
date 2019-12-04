import React from 'react';
import '../styles/Home.css';
import { Button, Form} from "react-bootstrap";
import {Link} from 'react-router-dom';

export default class GameListItem extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return(
      <div id="GameListItem">
        <h2>{this.props.name}</h2>
        <h3>{this.props.desc}</h3>
          <div>
            <Link
              to={{pathname: "game",
              state:{
                      gameID: this.props.id,
                      creator: false,
                      userID: this.props.userID,
                      username: this.props.username
                    }
              }}
            >
              <Button>
                Join!
              </Button>
            </Link>
          </div>
      </div>
    )
  }
}