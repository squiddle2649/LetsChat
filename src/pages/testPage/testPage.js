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
    return <div></div>    

}
export default TestPage