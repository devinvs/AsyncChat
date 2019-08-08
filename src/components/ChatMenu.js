import React from 'react';
import './ChatMenu.css'
import ToggleButton from 'react-toggle-button'
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';

//<ChatMenu users={["Devinisthebomb,trustme", "Me", "you", "us"]}/>

class ChatMenu extends React.Component{

    constructor(props){
        super(props)
        this.props = props

        this.state = {
            locked: false,
        }
    }

    render(){
        const hidden = this.props.hidden
        const borderRadiusStyle = { borderRadius: 2 }
        const className = "MenuContainer noselect" + (hidden? " hidden": "");
        const users = this.props.users
        const isHost = this.props.role === "host"

        return(
            <div className={className}>
                <div className="content">
                    <div className={"header" + (isHost? "": " hidden")}>Chat Controls</div>
                    <div className={"oneline"+ (isHost? "": " hidden")}>
                        <p>Lock:</p>
                        <ToggleButton 
                        inactiveLabel=""
                        activeLabel=""

                        colors={{
                            activeThumb:{
                                base: '#fafafa'
                            },
                            inactiveThumb:{
                                base: '#fafafa'
                            },
                            active:{
                                base: '#61afef'
                            },
                            inactive:{
                                base: '#282c34'
                            }
                        }}

                        value={this.state.locked || false}
                        thumbStyle={borderRadiusStyle}
                        trackStyle={borderRadiusStyle}
                        onToggle={(locked) => {
                            this.setState(
                                {locked: !locked}
                            )
                            this.props.lock(!locked)
                        }}
                    />
                    </div>
                    <div className="header">Users</div>
                    <SimpleBar style={{ height: '100%'}}>
                        <UserBlock name="You" role={this.props.role}/>
                    {users.map((x, i) =>
                        <UserBlock name={x.name} role={x.role} key={i} />
                    )}
                </SimpleBar>
                    
                </div>
            </div>
        )
    }
}

class UserBlock extends React.Component{

    constructor(props){
        super(props)
        this.props = props

        this.state = {
            buttonHidden: true
        }
    }

    toggleKickButton(){
        this.setState({
            buttonHidden: !this.state.buttonHidden
        })
    }

    render(){
        // const buttonClass = this.state.buttonHidden? " hidden small dark": " small dark"
        return (
            <div className="user oneline">
                <p>{this.props.name}</p><p>{this.props.role}</p>
                {/* <Button buttonClass={buttonClass} action={() => {}} text="Kick"></Button> */}
            </div>
        )
    }
}

export default ChatMenu