
import { Message, MessageContext } from './messageComponent'
import React, {useState,useEffect,useContext } from 'react';
import './messageStyling.css'

export const OptionsMenu = (props)=>{
    const showModal = useContext(MessageContext)
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
            setReactionsToggled(clickedElement.id==="reactionBox")
        }
        document.addEventListener('click', handleClick);

        return () => {
          document.removeEventListener('click', handleClick);
        };
      }, [reactionsToggled])
    return <div className='menuContainer whiteText' style={visibility}>
        {/* <div className=' redBGhover tight menuText pointer'>Pin message</div> */}
        <div 
            className=' redBGhover menuText pointer'
            onClick={showModal}    
        >Report message</div>
        {/* <div 
            className=' redBGhover tight menuText pointer reactionText'
            id='reactionBox'>
                Add a reaction
                <div style={emojisVisibility} className='reactionsBox'>
                    <h1 className='redBGhover emoji'>😃</h1>
                    <h1 className='redBGhover emoji'>😂</h1>
                    <h1 className='redBGhover emoji'>👍</h1>
                    <h1 className='redBGhover emoji'>😎</h1>
                    <h1 className='redBGhover emoji'>🤨</h1>
                    <h1 className='redBGhover emoji'>😱</h1>
                    <h1 className='redBGhover emoji'>😭</h1>
                    <h1 className='redBGhover emoji'>😜</h1>
                </div>
            </div> */}
    </div>

}