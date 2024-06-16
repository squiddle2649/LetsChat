
import { ChatroomContext } from "../chatroom";
import React, {  useState,useEffect,useContext,createContext } from 'react';
import { Message } from "./messageComponent/messageComponent";

export const MessagesContext = createContext()


export const MessagesList = ()=>{
    const chatroomContext = useContext(ChatroomContext)
    const chatroomRef = chatroomContext.chatroomRef
    const messages = chatroomContext.messages
    const user = chatroomContext.user
    const username = chatroomContext.username
    const friendName = chatroomContext.friendName

    const [selectedMessage, setSelectedMessage] = useState(null)
    
    

    useEffect(() => {
        const handleClick = (event) => {
            const clickedElement = event.target
            if(clickedElement.id==="reactionOption")return
            setSelectedMessage(clickedElement.id)
            /* Each options menu will have an ID that is the same ID as
            the corresponding message. Every other element in the website
            has no ID (undefined). So if a user clicks on a menu, it will
            open because it has the same ID as the clicked element. To close
            the menu, you can click literally where ever because
            it will have a different ID.
            */
        }
        document.addEventListener('click', handleClick);

        return () => {
          document.removeEventListener('click', handleClick);
        };
      }, [selectedMessage])

    return <ul className="listOfMessages" reversed>
        {messages.map((messageObject,index)=>(
            <MessagesContext.Provider value={selectedMessage}>
                <Message
                    username={messageObject.sender===user.uid?
                        username:friendName
                    }
                    continuousSender = {
                        index===0?false:
                        messageObject.sender===messages[index-1].sender
                    }
                    messageID={messageObject.id}
                    key={messageObject.id}
                    content={messageObject.content}
                    me={messageObject.sender===user.uid}
                    replying={messageObject.replying}
                ></Message>
            </MessagesContext.Provider>
        ))}
       
    </ul>
}


