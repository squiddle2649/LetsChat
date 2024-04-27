import "./messageStyling.css"
import { Options } from "../chatroomSVG"
import { ChatroomContext } from "../chatroom";
import React, {  useState,useRef,useEffect,useContext } from 'react';

export const MessagesList = ()=>{
    const chatroomContext = useContext(ChatroomContext)
    const messages = chatroomContext.messages
    const user = chatroomContext.user
    const username = chatroomContext.username
    const friendName = chatroomContext.friendName

    useEffect(() => {
        const handleClick = (event) => {
            const clickedElement = event.target
            console.log(clickedElement.classList.contains("optionSVG"))
        }
        document.addEventListener('click', handleClick);

        return () => {
          document.removeEventListener('click', handleClick);
        };
      }, [])

    return <ul className="listOfMessages" reversed>
        {messages.map((messageObject)=>(
            <Message
                username={messageObject.sender===user.uid?
                    username:friendName
                }
                key={messageObject.id}
                content={messageObject.content}
                me={messageObject.sender===user.uid}
            ></Message>
        ))}
    </ul>
}



export const Message = (props)=>{
    const usernameStyle= {
        color: props.me?"#277ab9":"#cd4e67",
        /* Color of username text will depend on whether 
        it is the user sending the message or the conversation partner */
        margin:"0",
    }   
    
    return <div className="arial flexRow" style={{marginTop:"8px",marginBottom:"15px"}}>
            <div className="messageOptions">   
                <Options></Options>
            </div>
            <div class="flexColumn">
                <p className=" arial-bold" style={usernameStyle}>
                    {props.username}
                </p>
                <h3 className="messageText blackText" style={{marginTop:"0"}}>{props.content}</h3>
            </div>
        </div>
 
}