import React from 'react';
import '../styles/Home.css';

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.handleMessageChange = this.handleMessageChange.bind(this)
    this.getMessages = this.getMessages.bind(this)
    this.sendMessage = this.sendMessage.bind(this)
    this.createChatList = this.createChatList.bind(this)
    this.state = {
      users: undefined,
      curMessage: "",
      messageList: []
    }
  }
  ws = new WebSocket('ws://localhost:3000/ws')
  componentDidMount() {
    this.getMessages();
    this.ws.onopen = () => {
      // on connecting, do nothing but log it to the console
      console.log('connected')
    }

    this.ws.onmessage = evt => {
      // listen to data sent from the websocket server
      const message = JSON.parse(evt.message)
      let messageList = this.state.messageList.unshift(evt.message)
      this.setState({messageList: messageList})
      console.log(message)
    }

    this.ws.onclose = () => {
      console.log('disconnected')
      // automatically try to reconnect on connection loss

    }
  }

  getMessages() {
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

  createChatList() {console.log(this.state.messageList);
    const renderedMessages = this.state.messageList.map((message, index) => {
      return (
        <div id="UserContainer">
          <p id="Username">{message.username}</p>
          <p id="Message">{message.message}</p>
        </div>
      )
    })

    return(
      <div id="MessageContainer">
        {renderedMessages}
      </div>
    )
  }

  sendMessage() {
    console.log(this.state.curMessage)
    // TODO need to send the guess to backend
    let message = {
      sender: this.props.userID,
      username: this.props.username,
      message: this.state.curMessage,
      uesrIDs: []
    }
    try {
      this.ws.send(message) //send data to the server
    } catch (error) {
        console.log(error) // catch error
    }
    let messageList = this.state.messageList
    messageList.unshift(message)
    console.log(messageList)
    this.setState({
      curMessage: "",
      messageList: messageList
    })
  }

  handleMessageChange(e) {
    this.setState({
      curMessage: e.target.value
    })
  }

  render() {
    return(
      <div id="UserListContainer">
        <h1>Global Chat</h1>
        {this.createChatList()}
        <div id="GuessContent">
          <input type="text" onChange={this.handleMessageChange} value={this.state.curMessage} style={{width: '50%'}} />
          <input
            type="button"
            value="Send"
            onClick={this.sendMessage}
          />
        </div>
      </div>
    )
  }
}