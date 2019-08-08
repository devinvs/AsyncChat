import React from 'react';
import ChatWindow from './components/ChatWindow'
import MessageInput from './components/MessageInput'
import ChatHeader from './components/ChatHeader'
import ChatMenu from './components/ChatMenu'
import Login from './components/Login'
import cryptico from './cryptico'
import Websocket from 'react-websocket'

class App extends React.Component {


  constructor(props){
    super(props)
    this.props = props

    const key =  cryptico.generateRSAKey(this.getCookie("_xsrf")? this.getCookie("_xsrf"): "Hello World", 1024);
    const publicKey = cryptico.publicKeyString(key);

    this.state = {
      showMenu: false,
      atLogin: true,
      error: "",
      messages: [],
      name: "",
      chatid: "",
      key: key,
      publicKey: publicKey,
      users: [],
      role: ""
    }
  }

  componentDidMount(){
    this.scroll()
  }

  scroll(){
      this._scroll.scrollTop = 0;
      this._scroll.scrollLeft = 0;
  }

  getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
  }

  toggleMenu(){
    const hidden = !this.state.showMenu
    this.setState({
      showMenu: hidden
    })
  }

  leave(){
    this.setState({
      atLogin: true,
      showMenu: false,
      error: "",
      messages: [],
      name: "",
      chatid: "",
      users: [],
      role: ""
    })

    this.scroll()
  }

  connect(name, chatid, newChat){
    if(!name || name===""){
      this.setState({error: "Username cannot be blank"})
    }else if (!newChat && (!chatid || chatid ==="")){
      this.setState({error: "Chat ID cannot be blank"})
    }else if(!newChat && chatid.length !== 4){
      this.setState({error: "Invalid Chat ID"})
    }else{
      this.setState({
        name: name,
        chatid: chatid,
        role: newChat? "host": "member"
      })
      let msg = {
        type: 0,
        sender: name,
        recipients: "",
        content: {
          name: name,
          chatid: chatid,
          newChat: newChat
        }
      }
      this.sendRaw(JSON.stringify(msg))
    }
    
  }

  onMessage(data){
    data = JSON.parse(data)
    const type = data.type

    if (type === 0){
      if(data.content.message === "Success"){
        this.setState({
          atLogin: false,
          name: data.content.name,
          chatid: data.content.chatid
        })

        let msg = {
          type: 1,
          sender: this.state.name,
          recipients: "",
          content:{
            name:this.state.name,
            public_key: this.state.publicKey
          }
        }

        this.sendRaw(JSON.stringify(msg))

      }else{
        this.setState({error: data.content.message})
      }
    }else if(type === 1){

      let users = this.state.users

      this.setState({
        users: users.concat([{name:data.content.name, key:data.content.public_key, role:data.content.role}])
      })
    }else if(type === 2){
      this.addMessage(data.content, data.sender, "sys")
    }else if(type === 3){
      let message = cryptico.decrypt(data.content, this.state.key).plaintext
      this.addMessage(message, data.sender, "msg")
    }
  }

  sendRaw(message){
    this.refWebsocket.sendMessage(message);
  }

  addMessage(message, sender, msgClass){
    let messages = this.state.messages
    messages.push({
      sender: sender,
      class: msgClass,
      content: message
    })

      this.setState({
        messages: messages
      })
  }

  send(message){
    this.addMessage(message, "You", "msg")

    for (const user of this.state.users){
      this.sendRaw(JSON.stringify({
        type: 3,
        sender: this.state.name,
        recipients: user.name,
        content: cryptico.encrypt(message, user.key).cipher
      }))
    }
  }

  componentDidUpdate(){
    this._scroll.scrollTop = "0";
    this._scroll.scrollLeft = "0";
  }

  lock(locked){
    if(locked){
      this.sendRaw(JSON.stringify({
        type: 4,
        sender: this.state.name,
        recipients: "",
        content: "lock"
      }))
    }else{
      this.sendRaw(JSON.stringify({
        type: 4,
        sender: this.state.name,
        recipients: "",
        content: "unlock"
      }))
    }
  }

  render() {
    const atLogin = this.state.atLogin

    return(
      <div ref={(div) => {this._scroll = div}}>
        <Login hidden={!atLogin} error={this.state.error} connect={(name, chatid, newChat) => {this.connect(name, chatid, newChat)}}/>
        <ChatHeader hidden={atLogin} chatID={this.state.chatid} toggle={() => {this.toggleMenu()}} leave={() => {this.leave()}}/>
        <ChatMenu hidden={!this.state.showMenu || atLogin} users={this.state.users} role={this.state.role} lock={this.lock.bind(this)}/>
        <ChatWindow hidden={atLogin}
          messages={this.state.messages} messageNum={this.state.messages.length}/>
        <div id="messageInput">
          <MessageInput hidden={atLogin} onSend={this.send.bind(this)}/>
        </div>
        <Websocket url="ws://localhost:8000/chatsocket"
          onMessage={this.onMessage.bind(this)} 
          ref={Websocket => {this.refWebsocket = Websocket}} />
      </div>
    );
  }
}
export default App;