import { ChatroomContext } from 'pages/chatroom/chatroom';
import { MessageContext } from './messageComponent'
import React, {useState,useEffect,useContext } from 'react';
import './messageStyling.css'

export const OptionsMenu = (props)=>{
    const messageContext = useContext(MessageContext)
    const chatroomContext = useContext(ChatroomContext)

    const showModal = messageContext.showModal
    const addAReaction = messageContext.addAReaction
    const me = messageContext.me
    const messageID = messageContext.messageID
    const content = messageContext.content

    const setReplying = chatroomContext.setReplying
    const friendName = chatroomContext.friendName
    const username = chatroomContext.username

    const emojis = ["😃","😂","😬","🤨","😎","😱","😭","🙄","🤝",'👍',"✌️","👏"]

    const [reactionsToggled, setReactionsToggled] = useState(false)
    const visibility={
        display:props.visible?"":"none"
    }
    const emojisVisibility = {
        display:reactionsToggled?"":"none"
    }
    useEffect(() => {
        const handleClick = (event) => {
            const clickedElement = event.target
            setReactionsToggled(clickedElement.id==="reactionOption")
        }
        document.addEventListener('click', handleClick);

        return () => {
          document.removeEventListener('click', handleClick);
        };
      }, [reactionsToggled])

    
    const optionClass = 'menuText redBGhover pointer small'
      
    return <div className='menuContainer whiteText' style={visibility}>
        <div 
            style={{
                display:me?"none":""
            }}
            className={optionClass}
            onClick={showModal}    
        >Report message</div>

        <div id="reactionOption" className={`${optionClass} reactionOption`}>
            <div id="reactionOption" >Add a reaction</div>
            <div style={emojisVisibility} className='emojisContainer'>
                <button className='removeReactionBtn redBGhover'
                        onClick={()=>{
                            addAReaction(null)
                        }}
                >Remove reaction</button>
                <div className="emojisBox">
                    {emojis.map((emoji)=>(
                        <h1 className='emoji redBGhover'
                            onClick={()=>{
                                addAReaction(emoji)
                            }}
                        >{emoji}</h1>
                    ))}
                   
                </div>
            </div>
        </div>
        <div
            className={optionClass}
            onClick={()=>{setReplying({
                id:messageID,
                content:content,
                senderName:me?username:friendName,
            })}}
        >Reply</div>

    </div>

}