import React from 'react';
import './Button.css'

class Button extends React.Component{

    constructor(props){
        super(props)
        this.props = props
    }

    click(){
        this.props.action()
    }

    render(){
        const buttonClass = "Button " + this.props.buttonClass
        return (
            <div className={buttonClass} onClick={() => {this.click()}}>
                {this.props.text}
            </div>
        )
    }
}

export default Button