import './testStyling.css'
import { Link } from 'react-router-dom';
import { AppLogo,ImBoredText } from 'components/logo/logoComponents';

import React, {  useState,useEffect,useRef,createContext } from 'react';

const TestPage = ()=>{
    const [reactionsToggled, setReactionsToggled] = useState(false)
    const visibility = {
        display:reactionsToggled?"":"none"
    }
    const testFunction = ()=>{
        console.log('yoyo')
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
    // return <div className='testContainer whiteText arial'>
    //     <div 
    //         // onMouseEnter={()=>{
    //         //     setReactionsToggled(true)}}
    //         // onMouseLeave={()=>{
    //         //     setReactionsToggled(false)}} 
    //         id="reactionBox"
    //         className='redBGhover tight testText pointer'>
    //             Add a reaction
    //             <div style={visibility} className='reactionsBox'>
    //                 <h1 className='redBGhover emoji'>😃</h1>
    //                 <h1 className='redBGhover emoji'>😂</h1>
    //                 <h1 className='redBGhover emoji'>👍</h1>
    //                 <h1 className='redBGhover emoji'>😎</h1>
    //                 <h1 className='redBGhover emoji'>🤨</h1>
    //                 <h1 className='redBGhover emoji'>😱</h1>
    //                 <h1 className='redBGhover emoji'>😭</h1>
    //                 <h1 className='redBGhover emoji'>😜</h1>
    //             </div>
    //     </div>
    //     <div className='redBGhover tight testText pointer'>Report</div>
    //     <div className='redBGhover tight testText pointer'>Pin</div>
}
export default TestPage