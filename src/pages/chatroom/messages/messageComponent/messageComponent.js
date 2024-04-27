import { OptionsSVG } from './messageSVG';
import { MessagesContext } from '../messagesList'
import React, {useContext,useState } from 'react';
import { OptionsMenu } from './optionsMenu';
import './messageStyling.css'
import { getByDisplayValue } from '@testing-library/react';

export const Message = (props)=>{
    const [hoveringMessage,setHoveringMessage] = useState(false)

    const messagesContext = useContext(MessagesContext)
    const selectedMessage = messagesContext

    const messageID = props.messageID
    const showMenu = selectedMessage===messageID

    const usernameStyle= {
        color: props.me?"#277ab9":"#cd4e67",
        /* Color of username text will depend on whether 
        it is the user sending the message or the conversation partner */
        margin:"0",
    }   

    const optionButtonVisibility = {
        display:hoveringMessage?"":"none"
    }

    return <div 
                className="arial flexRow flexSpaceBetween" 
                style={{marginTop:"8px",marginBottom:"15px"}}
                onMouseEnter={()=>{setHoveringMessage(true)}}
                onMouseLeave={()=>{setHoveringMessage(false)}}
                
            >
            
            <div class="flexColumn">
                <p className=" arial-bold" style={usernameStyle}>
                    {props.username}
                </p>
                <h3 className="messageText blackText" style={{marginTop:"0"}}>{props.content}</h3>
            </div>
            <div className="messageOptionContainer" style={optionButtonVisibility}>
                <OptionsMenu visible={showMenu}></OptionsMenu>
                <OptionsSVG messageID={messageID}></OptionsSVG>
            </div>
        </div>
 
}