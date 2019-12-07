import React from 'react';
import '../styles/Home.css';

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.handleMessageChange = this.handleMessageChange.bind(this)
    this.getMessages = this.getMessages.bind(this)
    this.sendMessage = this.sendMessage.bind(this)
    this.createChatList = this.createChatList.bind(this)
    this.runScript = this.runScript.bind(this)
    this.state = {
      users: undefined,
      curMessage: "",
      messageList: []
    }
  }
  ws = new WebSocket('wss://fpapi.nathanmagdalera.me:443/ws')
  componentDidMount() {
    this.getMessages(); 
    this.ws.onopen = () => {
      // on connecting, do nothing but log it to the console
      console.log('connected')
    }

    this.ws.onmessage = evt => {
      // listen to data sent from the websocket server
      // const message = JSON.parse(evt.message)
      let message = JSON.parse(evt.data)
      let messageList = this.state.messageList

      messageList.unshift({
        UserName: message.username,
        MessageBody: message.message
      })
      this.setState({messageList: messageList})
    }

    this.ws.onclose = () => {
      console.log('disconnected')
      // automatically try to reconnect on connection loss

    }
  }

  getMessages() {
    fetch('https://fpapi.nathanmagdalera.me:443/v1/messages', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    }).then((response) => { return response.json() })
    .then((responseJSON) => {
      console.log(responseJSON)
      this.setState({
        messageList: responseJSON
      })
    }).catch((err) => console.log(err))
  }

  createChatList() {
    console.log(this.state.messageList)
    const renderedMessages = this.state.messageList.map((message, index) => {
      return (
        <div id="UserContainer">
          <p id="Username">{message.UserName}</p>
          <p id="Message">{message.MessageBody}</p>
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
    // TODO need to send the guess to backend
    console.log(this.props.userID)
    console.log(this.state.curMessage)
    fetch("https://fpapi.nathanmagdalera.me:443/v1/messages", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userid: this.props.userID,
        message: this.state.curMessage,
        username: this.props.username
      })
    }).then((response) => { return response.json()})
    .then((responseJSON) => {
      console.log(responseJSON)
    }).catch((err) => console.log(err))

    // let messageList = this.state.messageList
    // messageList.unshift(message)
    this.setState({
      curMessage: ""
    })
  }

  handleMessageChange(e) {
    this.setState({
      curMessage: e.target.value
    })
  }

   runScript(event) {
    if (event.which == 13 || event.keyCode == 13) {
        this.sendMessage()
        return false;
    }
    return true;
};

  render() {
    return(
      <div id="UserListContainer">
        <h1>Global Chat</h1>
        {this.createChatList()}
        <div id="GuessContent">
        
          <input type="text" onChange={this.handleMessageChange} value={this.state.curMessage} style={{width: '50%'}} onKeyPress={e => this.runScript(e)}/>
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