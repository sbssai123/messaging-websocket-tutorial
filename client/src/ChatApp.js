import React, { Component } from 'react'
import './ChatApp.css';

const URL = 'ws://localhost:8080'

// Message types
const NEW_USER_JOINED = "NEW_USER_JOINED"
const NEW_MESSAGE = "NEW_MESSAGE"

// Represents the 
class ChatApp extends Component {

  state = {
    // A Message consists of: User Name that Sent, Message Body, Timestamp
    messages: [],
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
      this.setState({messages: allMessages})
    }

    this.ws.onclose = () => {
      console.log("disconnected")
    }
  }

  // Submit message to be broadcasted to chat room
  submitMessageToChat = (e) => {
    e.preventDefault() // Prevent page from reloading
    const { currentUser, currentMessageBody } = this.state
    const now = new Date()
    const timestamp = now.getHours() + ":" + now.getMinutes()
    const newMessage = {"type": NEW_MESSAGE, "userName": currentUser, "messageBody": currentMessageBody, "timestamp": timestamp}
    // Send message through socket
    this.ws.send(JSON.stringify(newMessage))

    // Add message to state and reset currentMessage
    const allMessages = [...this.state.messages, newMessage]
    this.setState({messages: allMessages})
    this.setState({currentMessageBody: ""})
  }

  handleMessageChange = (event) => {
    this.setState({currentMessageBody: event.target.value})
  }

  submitName = (e) => {
    e.preventDefault()
    const newUser = e.target[0].value
    this.setState({currentUser: newUser})
    const userJoinedMessage = {"type": NEW_USER_JOINED, "userName": newUser}
    this.ws.send(JSON.stringify(userJoinedMessage))
  }

  render() {
    const renderedMessages = this.state.messages.map((message) => <Message message={message} 
    currentUser={this.state.currentUser}/>)
    return (
      <div className="container-flex">
        <div className="row">
          <div className="col">
            <h2 className="header">👋🏾Welcome {this.state.currentUser} to the IvyHacks Chat App</h2> 
          </div>
        </div>
        <div className="row all-messages">
          <div className="col">
            {renderedMessages}
          </div>
        </div>
        <div className="row">
          <div className="col">
            <MessageInputBox submitMessageToChat={this.submitMessageToChat} 
          handleMessageChange={this.handleMessageChange} currentMessageBody={this.state.currentMessageBody}
          currentUser={this.state.currentUser} submitName={this.submitName}/>
          </div>
        </div>
      </div>
    )
  }
}

// Represent writing and submitting a new message
// into the chat
const MessageInputBox = ({submitMessageToChat, handleMessageChange, currentMessageBody, currentUser, submitName}) => {
  if (currentUser) {
    return (
      <>
        <form className="fixed-bottom message-input-box" onSubmit={submitMessageToChat}>
          <div className="form-group">
            <input className="form-control new-message" type="text" placeholder="Enter a new message" value={currentMessageBody} onChange={handleMessageChange} />
            <input className="submit-button" type="submit" value="Submit" />
          </div>
        </form>
      </>
    )
  }
  return (
    <EnterNameInput submitName={submitName}/>
  )
}

// Represents a Message in the Chat
const Message = ({message, currentUser}) => {
  const name = message.userName === currentUser ? "You" : message.userName
  if (message.type === NEW_MESSAGE) {
    return (
      <>
        <div>
          <p className="message"><b> {message.timestamp} - {name}: </b>{message.messageBody}</p>
        </div>
      </>
    )
  }
  if (message.type === NEW_USER_JOINED) {
    return (
      <>
        <div>
          <p className="user-joined">{message.userName} has joined the chat</p>
        </div>
      </>
    )
  }
}

// Represents Input To Join Chat
const EnterNameInput = ({submitName}) => {
  return (
    <>
      <form className="fixed-bottom name-input" onSubmit={submitName}>
        <div className="form-group input-group">
          <input className="form-control" type="text" name="username" placeholder="Enter Name to Start Chatting" />
        <div className="input-group-btn"><input className="btn btn-primary" type="submit" value="Submit" /></div>
        </div>
      </form>
    </>
  )
}

export default ChatApp;
