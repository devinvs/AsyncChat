import React from 'react';
import TextareaAutosize from 'react-autosize-textarea'
import './MessageInput.css';

class MessageInput extends React.Component {

    constructor(props){
        super(props);
        this.props = props;
        this.placeholder = this.props.placeholder

        this.state = {
            value: this.placeholder,
            sending: false
        };
    }

    handleFocus(isFocused){
        if(isFocused && this.state.value === this.placeholder){
            this.setState(() => {
                return {value: ""};
            })
        }else if(!isFocused && this.state.value === ''){
            this.setState(() => {
                return {value: this.placeholder}
            })
        }
    }

    onChange(evt){
        this.setState({value: evt.target.value})
    }

    send(){
        if(this.state.value){
            // this.msgInput.focus()
            this.props.onSend(this.state.value);
            this.setState({value: ''})
            this.toggleAnimation()
        }
    }

    onKeyDown(evt){
        if(evt.keyCode === 13){
            evt.preventDefault();
            this.send()
        }
    }

    toggleAnimation(){
        this.setState({
            sending: !this.state.sending
        })
    }

    render(){

        return (
            <span className={this.props.hidden? "MessageInput hidden": "MessageInput"}>
                <TextareaAutosize
                        id="text"
                        name="text"
                        rows={this.state.rows}
                        value={this.state.value}
                        onFocus={() => this.handleFocus(true)}
                        onBlur={() => this.handleFocus(false)}
                        onKeyDown={(evt) => this.onKeyDown(evt)}
                        onChange={(evt) => this.onChange(evt)}
                        innerRef={(ref) => {this.msgInput=ref}}
                        disabled={this.props.hidden}
                        onResize={() => {console.log("Resize")}}>

                </TextareaAutosize>

                <svg className={(this.state.value && this.state.value !== this.placeholder? "enabled": "") + (this.state.sending? " send": "")} onClick={() => {this.send()}} onAnimationEnd={() => {this.toggleAnimation()}} version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"  x="0px" y="0px"
                    viewBox="0 0 96 96">
                <g id="XMLID_2_">
                    <path id="XMLID_4_"  d="M74.6,20.8c0.7,0.5,1,1.1,0.8,2l-7.9,47.1c-0.1,0.6-0.4,1.1-1,1.4c-0.3,0.2-0.6,0.2-1,0.2
                        c-0.2,0-0.5-0.1-0.7-0.2L51,65.7l-7.4,9.1c-0.4,0.5-0.9,0.7-1.5,0.7c-0.3,0-0.5,0-0.7-0.1c-0.4-0.1-0.7-0.4-0.9-0.7
                        c-0.2-0.3-0.4-0.7-0.4-1.1V62.8l26.5-32.5L33.9,58.7l-12.1-5c-0.8-0.3-1.2-0.8-1.2-1.7c0-0.8,0.3-1.4,1-1.8l51.1-29.5
                        c0.3-0.2,0.6-0.3,1-0.3C73.9,20.5,74.3,20.6,74.6,20.8z"/>
                </g>
                </svg>
            </span>
          );
    }
  
}

export default MessageInput;