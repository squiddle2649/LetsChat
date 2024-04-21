import {set,ref} from 'firebase/database'
import {signInAnonymously} from 'firebase/auth'
import {database,auth} from 'firebaseConfig/firebase'
import React, {  useState ,useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useObject } from 'react-firebase-hooks/database';
import {useNavigate} from 'react-router-dom'

import './startPageStyling.css'
import { GoArrow } from './startPageSVGs';

const StartPage = () =>{

    const [username,setUsername]=useState("")
    const [user, loadingUser, userError] = useAuthState(auth);
    const navigate = useNavigate()
    const userDocumentRef = user?ref(database, `Users/${user.uid}`):null

    const [userDocument, loadingUserDocument, errorUserDocument] = 
        useObject(userDocumentRef)   

    const signIn = async()=>{
        try{
            await signInAnonymously(auth)  
        }
        catch(err){
            alert(`An error occured while signing in: ${err.message}`)

        }
        
    }
    
    const addUserToDatabase = async()=>{
        const userDocumentRef = ref(database,`Users/${user.uid}`)
        const currentDate = new Date()
        try{
            await set(userDocumentRef,{
                username:username,
                dateCreated:currentDate.getTime()
            })
            navigate('/chat')
        }
        catch(err){ 
            alert(`An error occured: ${err.message}`)

        }

    }
    // const checkDocumentExists = async(id)=>{
    //     if(userDocument.exists()){
    //         navigate('/chat')
    //     }
    //     else{

    //     }
    //     try{
    //         const documentRef = ref(database, `Users/${id}`)
    //         const snapshot = await get(documentRef)
    //         if(snapshot.exists()){
    //             navigate('/chat')
    //         }
    //         else{
    //             addUserToDatabase()
    //         }
    //     }
    //     catch(err){
    //         addUserToDatabase()
    //     }
        
    // }
    useEffect(()=>{
        if(!user||!userDocument)return
        if(userDocument.exists()){
            navigate('/chat')
        }
        else{
            addUserToDatabase()
        }
    },[userDocument,user])
    
    {/* If info is still loading, show loading screen */}
    {/* If not loading, then show normal start page */}

    return <div className='flexCenter startPageContainer arial'>
        {(loadingUserDocument||loadingUser)?
            /* If info is still loading, show loading screen */
        <h1 style={{color:'green'}}>loading start page</h1>:
            /* If it's no longer loading, then show normal start page */
        <form className="flexCenter" onSubmit={(e)=>{
            e.preventDefault()
            signIn()
        }}>
            <label><h1>👋 Hi, my name is </h1></label>
            <input className='nameInput' required type="text"  onChange={(e)=>{
                setUsername(e.target.value)
            }}></input>    
            <button className='enterButton flexCenter' type='submit'><GoArrow></GoArrow></button>
        </form> }
        
        
    </div>
}
export default StartPage