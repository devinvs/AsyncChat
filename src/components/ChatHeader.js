import React from 'react';
import './ChatHeader.css'
import Button from './Button'

class ChatHeader extends React.Component{

    constructor(props){
        super(props)

        this.props = props;

    }

    menuToggle(){
        this.props.toggle()
    }

    render(){
        return (
            <div className={(this.props.hidden? "ChatHeader hidden noselect": "ChatHeader noselect")}>
                <div id="menu" onClick={() => {this.menuToggle()}}>
                &#9776; {this.props.chatID}
                </div>
                <Button buttonClass="dark small" text="Leave" action={() => {this.props.leave()}}></Button>
            </div>
        )
    }
}

export default ChatHeader