import "./messageStyling.css"
import { ChatroomContext } from "../chatroom";
import React, {  useState,useEffect,useContext,createContext } from 'react';
import { Message } from "./messageComponent";

export const MessagesContext = createContext()


export const MessagesList = ()=>{
    const chatroomContext = useContext(ChatroomContext)
    const messages = chatroomContext.messages
    const user = chatroomContext.user
    const username = chatroomContext.username
    const friendName = chatroomContext.friendName

    const [selectedMessage, setSelectedMessage] = useState(null)
    

    useEffect(() => {
        const handleClick = (event) => {
            const clickedElement = event.target
            setSelectedMessage(clickedElement.id)
        }
        document.addEventListener('click', handleClick);

        return () => {
          document.removeEventListener('click', handleClick);
        };
      }, [selectedMessage])

    return <ul className="listOfMessages" reversed>
        {messages.map((messageObject)=>(
            <MessagesContext.Provider value={selectedMessage}>
                <Message
                    username={messageObject.sender===user.uid?
                        username:friendName
                    }
                    messageID={messageObject.id}
                    key={messageObject.id}
                    content={messageObject.content}
                    me={messageObject.sender===user.uid}
                ></Message>
            </MessagesContext.Provider>
        ))}
    </ul>
}


