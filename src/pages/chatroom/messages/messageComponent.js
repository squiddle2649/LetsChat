import {OptionsSVG} from './../chatroomSVG'
import { MessagesContext } from './messagesList'
import React, {  useState,useRef,useEffect,useContext,createContext } from 'react';

export const Message = (props)=>{
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
    const OMStyling = {
        width:'30px',
        height:'30px',
        backgroundColor:'green',
        display:showMenu?"":"none"
    }
    
    return <div className="arial flexRow" style={{marginTop:"8px",marginBottom:"15px"}}>
            <div className="messageOptions">   
                <OptionsSVG messageID={messageID}></OptionsSVG>
            </div>
            <div class="flexColumn">
                <p className=" arial-bold" style={usernameStyle}>
                    {props.username}
                </p>
                <h3 className="messageText blackText" style={{marginTop:"0"}}>{props.content}</h3>
            </div>
            <div style={OMStyling}></div>
        </div>
 
}