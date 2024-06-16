import './testUIStyling.css'
import React, {useState,useEffect,useContext, useRef } from 'react';

export const TestUI = ()=>{
    return <div className='pageContainer' >
        <div className='messageContainer'>
            <div className='line'></div>
            <div><strong>Bruno</strong></div>
            <div>Why hello there!!</div>
        </div>
        
    </div>
}
