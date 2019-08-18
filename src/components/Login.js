import React from 'react';
import './Login.css'
import Button from './Button'

class Login extends React.Component{

    constructor(props){
        super(props)

        this.props = props

        this.state = {
            newChat: true,
            name: "",
            chatid: ""
        }
    }

    toggleJoin(){
        this.setState({
            newChat: !this.state.newChat
        })
    }

    joinChat(){
        this.props.connect(this.state.name, this.state.chatid, this.state.newChat)
    }

    alphaOnly(evt, spaces){
        var key = evt.charCode;
        if(!((/^[a-z0-9]$/i.test(evt.key)) || key === 8 || (key === 32 && spaces))){
            evt.preventDefault();
        }
        if(evt.key === "Enter" && !this.props.hidden){
            evt.preventDefault();
            this.joinChat();
        }
    }

    onNameChange(evt){
        this.setState({name: evt.target.value})
    }

    onChatChange(evt){
        this.setState({
            chatid: evt.target.value.slice(0,4)
        })
    }

    render(){
        const newChat = this.state.newChat
        const error = this.props.error
        let hidden = this.props.hidden
        // if(error === "Success"){
        //     hidden="true"
        // }
        return(
            <div className={hidden? "Login hidden": "Login"}>
                <div className="name">
                    <input disabled={hidden} type="text" placeholder="Username" value={this.state.name} onKeyPress={(evt) => {this.alphaOnly(evt, true)}} onChange={(evt) => {this.onNameChange(evt)}}></input>
                </div>
                <div className="chatid">
                    <div id="chatEntry"><input disabled={hidden} className={newChat? "":"join"} type="text" value={this.state.chatid} placeholder="CHATID" onKeyPress={(evt) => {this.alphaOnly(evt, false)}} onChange={(evt) => {this.onChatChange(evt)}}></input>
                    <p id="error">{error}</p></div>
                    <div className="oneline">
                        <Button buttonClass="dark" text={newChat? "New Chat": "Back"} action={hidden? () => {}: () => {newChat? this.joinChat():this.toggleJoin()}}/>
                        <Button buttonClass="dark" text={newChat? "Join Chat": "Join"} action={() => {newChat? this.toggleJoin(): this.joinChat()}}/>
                    </div>
                </div>
            </div>
        )
    }
}

export default Login