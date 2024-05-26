import './testUIStyling.css'
import React, {useState,useEffect,useContext, useRef } from 'react';

export const TestUI = ()=>{
    const box = useRef(null)
    useEffect(()=>{
        if(!box.current)return
        box.current.scrollTop = box.current.scrollHeight
    },[])

    return <div className='pageContainer flexCenter'>
        <div ref={box} className="box">
            <h1>you</h1>
            <h1>are</h1>
            <h1>my</h1>
            <h1>body</h1>
            <h1>the</h1>
            <h1>one</h1>
            <h1>desire</h1>
            <h1>to me</h1>
            <h1>when I</h1>
            <h1>say</h1>
        </div>
    </div>
}
