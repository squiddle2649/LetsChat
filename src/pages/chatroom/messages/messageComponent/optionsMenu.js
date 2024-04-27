import { Message, MessageContext } from './messageComponent'
import React, {useState,useRef,useContext } from 'react';
import './messageStyling.css'

export const OptionsMenu = (props)=>{
    const showModal = useContext(MessageContext)
    const visibility={
        display:props.visible?"":"none"
    }
    return <div className='menuContainer whiteText' style={visibility}>
        <div className=' redBGhover tight menuText pointer'>Pin message</div>
        <div className=' redBGhover tight menuText pointer'
            onClick={showModal}    
        >Report message</div>
        <div className=' redBGhover tight menuText pointer'>Add a reaction</div>
    </div>

}