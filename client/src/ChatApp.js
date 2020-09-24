import React, { Component } from 'react'
import './App.css';

const URL = 'ws://localhost:8080'

// Represents the 
class ChatApp extends Component {

  state = {
    // A Message consists of: User Name that Sent, Message Body, Timestamp
    messages: [],
    users: [],
    currentUser: "",
    currentMessageBody: ""
  }

  ws = new WebSocket(URL)

  componentDidMount() {
    this.ws.onopen = () => {
      console.log("Connected!")
    }


    // When receiving a message through the socket,
    // add it to the state
    this.ws.onmessage = (event) => {
      console.log(event)
      const incomingMessage = JSON.parse(event.data)
      const allMessages = [...this.state.messages, incomingMessage]
      console.log(incomingMessage)
      this.setState({messages: allMessages})
    }

    this.ws.onclone = () => {
      console.log("disconnected")
    }
  }

  submitMessageToChat = (e) => {
    e.preventDefault()
    const { currentUser, currentMessageBody } = this.state
    const now = new Date()
    const timestamp = now.getHours() + ":" + now.getMinutes()
    const newMessage = {"userName": currentUser, "messageBody": currentMessageBody, "timestamp": timestamp}
    // Send message through socket
    this.ws.send(JSON.stringify(newMessage))

    // Add message to state and reset currentMessage
    const allMessages = [...this.state.messages, newMessage]
    this.setState({messages: allMessages})
    this.setState({currentMessageBody: ""})
  }

  handleMessageChange = (event) => {
    this.setState({currentMessageBody: event.target.value});
  }

  render() {
    console.log(this.state.messages)
    return (
      <div className="container-flex">
        <MessageInputBox submitMessageToChat={this.submitMessageToChat} 
        handleMessageChange={this.handleMessageChange} currentMessageBody={this.state.currentMessageBody}/>
      </div>
    );
  }

}


// Represent writing and submitting a new message
// into the chat
const MessageInputBox = ({submitMessageToChat, handleMessageChange, currentMessageBody}) => {
  return (
    <>
      <form onSubmit={submitMessageToChat}>
        <input type="text" placeholder="Enter new message" value={currentMessageBody} onChange={handleMessageChange} />
        <input type="submit" value="Submit" />
      </form>
    </>
  )
};

export default ChatApp;
