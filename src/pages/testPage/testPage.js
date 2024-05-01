import './testStyling.css'
import { database,auth } from 'firebaseConfig/firebase'
import { ref,set,get,remove } from 'firebase/database'
import { useAuthState } from "react-firebase-hooks/auth"

import React, {  useState,useEffect,useRef,createContext } from 'react';

const TestPage = ()=>{
    const [user,loadingUser,userError] = useAuthState(auth)
    const [text,setText] = useState(null)
    const locationReference = ref(database,"Users")
    const [result, setResult] = useState(null)
    const submit = async()=>{
        const dbObject = {username:"zilch"}
        try{
            const users = await get(locationReference)            
            setResult(JSON.stringify(users.val()))
        }
        catch(err){
            alert(err.message)
        }
    }

    return <div>
        <form onSubmit={(e)=>{
            e.preventDefault()
            submit()
        }}>
            <input 
                placeholder='enter some text'
                onChange={(e)=>{
                    setText(e.target.value)
                }}
            ></input>
            <button type='submit'>Submit</button>
        </form>
        <p>result: {result}</p>

    </div>
}
export default TestPage