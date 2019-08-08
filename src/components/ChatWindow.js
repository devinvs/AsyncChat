import React from 'react';
import './ChatWindow.css';

class ChatWindow extends React.Component{

    constructor(props){
        super(props)

        this.props = props
        this.state = {
            autoscroll: true,
            showNewMessage: false,
            messageNum: 0
        }
    }

    componentDidMount(){
        this.scrollToBottom()
    }

    componentDidUpdate(){

        if(this.props.messageNum > this.state.messageNum){
            if(this.state.autoscroll){
                this.scrollToBottom()
            }else if(!this.state.showNewMessage){
                this.setState({showNewMessage: true})
            }
            this.setState({messageNum: this.props.messageNum})
        }else if (this.props.messageNum == 0 && this.state.messageNum !== 0){
            this.setState({messageNum: 0})
        }
    }

    scrollToBottom(){
        //(this._scroll.scrollHeight - this._scroll.clientHeight).toString() + "px"
        this._scroll.scrollTop = this._scroll.scrollHeight;
    }

    handleScroll(){
        this.setState({
            autoscroll: this._scroll.scrollTop + this._scroll.clientHeight + 33 > this._scroll.scrollHeight
        })
        this.setState({
            showNewMessage: !this.state.autoscroll && this.state.showNewMessage
        })
    }

    handleNewMessage(){
        this.setState({
            showNewMessage: !this.state.showNewMessage
        })
        this.scrollToBottom()
    }

    render(){

        return (
            <div className={this.props.hidden? "ChatWindow hidden noselect": "ChatWindow noselect"}>
                <div className="MessageContainer" ref={(div) => {this._scroll = div}} onScroll={() => {this.handleScroll()}}>
                   
                    {this.props.messages.map((x, i) =>
                        <MessageBox key={i} content={x.content} msgClass={x.class} sender={x.sender}/>
                    )}
                    <div className={this.state.showNewMessage? "newMessage": "newMessage hidden"} onClick={() => {this.handleNewMessage()}}>
                        <p>New Message</p><svg className="icon" viewBox="0 0 2048 2048" xmlns="http://www.w3.org/2000/svg"><path d="M1523 864q0 13-10 23l-466 466q-10 10-23 10t-23-10l-466-466q-10-10-10-23t10-23l50-50q10-10 23-10t23 10l393 393 393-393q10-10 23-10t23 10l50 50q10 10 10 23z"/></svg>
                    </div>
                </div>
            </div>
        )
    }
}

class MessageBox extends React.Component{

    constructor(props){
        super(props)

        this.state = {
            content: this.props.content,
            sender: this.props.sender
        }
    }

    render(){
        const className = "Message " + this.props.msgClass

        if(this.props.msgClass === "msg"){
            return (
                <div className={className + " oneline"}>
                    <div>{this.state.sender + ':  ' + this.state.content}</div>
                </div>     
            )
        }else{
            return (
                <div className={className}>
                    {this.state.content}
                </div>
            )
        }
        
    }
}

export default ChatWindow