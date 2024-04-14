import {set,onValue,ref} from 'firebase/database'
import {signInAnonymously} from 'firebase/auth'
import {database,auth} from 'firebaseConfig/firebase'
import React, {  useState,useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';

import {useNavigate} from 'react-router-dom'


const StartPage = () =>{
    const [username,setUsername]=useState("")
    const [user, loading, error] = useAuthState(auth);
    const navigate = useNavigate()
    if(user){
        navigate('/chat')
    }
    
    const signIn = async()=>{
        try{
            await signInAnonymously(auth)
        }
        catch(err){
            alert(err.message)
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
            alert(err.message)
        }

    }
    if(user){
        addUserToDatabase()
    }
    
    const generateRandomKey=(length)=> {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
    const sortArray = (arr)=>{
            /* sorts an array such as
        [{dateCreated: 1713, username: 'mike'},
        {dateCreated: 172, username: 'tyson'},
        {dateCreated: 100, username: 'Bruno'}] in ascending order*/
        arr.sort((a,b)=>
            b.dateCreated-a.dateCreated
        )
        return arr
    }

    return <div>
        <form onSubmit={(e)=>{
            e.preventDefault()
            signIn()
        }}>
            <label>Hi, my name is </label>
            <input required type="text"  onChange={(e)=>{
                setUsername(e.target.value)
            }}></input>    
            <button type='submit'>Enter</button>
        </form>        
        
        
    </div>
}
export default StartPage