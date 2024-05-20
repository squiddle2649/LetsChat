
import { MessageContext } from './messageComponent'
import React, {useState,useEffect,useContext } from 'react';
import './messageStyling.css'

export const OptionsMenu = (props)=>{
    const messageContext = useContext(MessageContext)
    const showModal = messageContext.showModal
    const addAReaction = messageContext.addAReaction
    const me = messageContext.me
    const emojis = ["😃","😂","👍","🍆","🤨","😱","😭"]

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

    
    const optionClass = 'testMenuText redBGhover pointer'
      
    return <div className='menuContainer whiteText' style={visibility}>
        <div 
            style={{
                display:me?"none":""
            }}
            className={optionClass}
            onClick={showModal}    
        >Report message</div>

        <div id="reactionOption" className={`${optionClass} reactionOption`}>
            <div id="reactionOption">Add a reaction</div>
            <div style={emojisVisibility} className='emojisContainer'>
                
                {emojis.map((emoji)=>(
                    <h1 className='redBGhover emoji'
                        onClick={()=>{
                            addAReaction(emoji)
                        }}
                    >{emoji}</h1>
                ))}
                <h1 className='redBGhover emoji'
                    onClick={()=>{
                        addAReaction(null)
                    }}
                >❌</h1>
            </div>
        </div>

    </div>

}