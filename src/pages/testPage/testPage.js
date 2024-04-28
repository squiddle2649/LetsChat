import './testStyling.css'
import { database } from 'firebaseConfig/firebase'
import { ref,set,get,remove } from 'firebase/database'
import React, {  useState,useEffect,useRef,createContext } from 'react';

const TestPage = ()=>{
    const [text,setText] = useState(null)
    const locationReference = ref(database,"Queue/lego123")
    const [result, setResult] = useState(null)

    const submit = async()=>{
        const dbObject = {username:"zilch"}
        try{

            await set(locationReference,dbObject)
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