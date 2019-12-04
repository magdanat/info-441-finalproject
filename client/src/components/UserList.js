import React from 'react';
import '../styles/Home.css';

export default class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.getUpdatedUsers = this.getUpdatedUsers.bind(this)
    this.state = {
      users: undefined
    }
  }

  componentDidMount() {
    this.getUpdatedUsers();
  }

  getUpdatedUsers() {
    console.log(this.props.gameID)
    fetch('http://localhost:80/v1/games/' + this.props.gameID + "/players", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    }).then((response) => { return response.json() })
    .then((responseJSON) => {
      console.log(responseJSON)
      this.setState({
        users: responseJSON
      })
    }).catch((err) => console.log(err))
  }

  createGameList() {
    if(this.state.users != undefined) {
      console.log(this.state.users)
      const renderedUsers = this.state.users.map((user, index) => {
        return (
          <div id="UserContainer">
            <p id="Username">{user.UserName}</p>
            <p>Score: {user.SCORE}</p>
          </div>
        )
      })
  
      return(
        <div>
          {renderedUsers}
        </div>
      )
    }
  }
  render() {
    return(
      <div id="UserListContainer">
        {this.createGameList()}
      </div>
    )
  }
}