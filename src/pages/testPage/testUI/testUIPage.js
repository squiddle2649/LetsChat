import './testUIStyling.css'
import React, {useState,useEffect,useContext, useRef } from 'react';

export const TestUI = ()=>{
    const dialogWindow = useRef(null)

    const openWindow = ()=>{
        dialogWindow.current.showModal()
    }
    const closeWindow = ()=>{
        dialogWindow.current.close()
    }

    return <div className='pageContainer flexCenter'>
        <button onClick={openWindow}>Open window</button>
        <dialog ref={dialogWindow}>
            <h1>Heyo</h1>
            <h3>Working?</h3>
            <button onClick={closeWindow}>close</button>
        </dialog>    

    </div>
}
