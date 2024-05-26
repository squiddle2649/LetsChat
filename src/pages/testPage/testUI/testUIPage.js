import './testUIStyling.css'
import React, {useState,useEffect,useContext, useRef } from 'react';
import { Logo } from 'components/logo/logo';
import { Link } from 'react-router-dom';

export const TestUI = ()=>{
    const logoStyle = {
        position:'absolute',
        top:"30px",
        left:'30px'
    }
    return <div className='arial flexCenter flexColumn errorPageContainer'>
        <div style={logoStyle}>
            <Link to="/chat">
                <Logo></Logo>
            </Link>
        </div>
        <div className="flexCenter" >
            <h1 style={{marginBottom:"0"}}>🙃</h1>
            <h2 style={{marginBottom:"0"}}>Whoops…something's gone wrong</h2>
        </div>
        <h3>Please try reloading the page. If this error persists, try again later.</h3>
        <Link to={"/chat"}><h3>Take me home</h3></Link>
    </div>
}
