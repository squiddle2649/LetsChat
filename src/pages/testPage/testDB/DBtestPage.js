import './testDBStyling.css'
import React, {useState,useEffect,useContext } from 'react';
import { useAuthState } from "react-firebase-hooks/auth"
import { ref,get,update} from 'firebase/database';
import { database,auth } from 'firebaseConfig/firebase';

const TestDB  = () => {
    const [username,setUsername] = useState("")
    const userID = "9X8oqSDo3Je1iZhmuxYa2Cwnz3H3"
    const friendID = "NAaA4WMAOxbkeTrnhLhObGgomiH3"
    const [user,loadingUser,userError] = useAuthState(auth)

    const messageRef = ref(database,`Users/${friendID}/`)

    const getUserName = async()=>{
        try{
            const user = await get(messageRef)
            const message = user.val()['username']
            setUsername(JSON.stringify(message))
        }
        catch(err){
            alert(err.message)
        }
    }
    const setReaction = async()=>{
        try{
            await update(messageRef,{reaction:"👙"})
        }
        catch(err){
            alert(err.message)
        }
    }

    return <div>
        <h2>Username:</h2>
        <h3>{username}</h3>
        <button 
            style={{
            marginTop:"100px"
        }}
            onClick={getUserName}
        >get user yo</button>
        <button 
            style={{
            marginTop:"100px"
        }}
            onClick={setReaction}
        >add reaction</button>
        <p>is there a user? {JSON.stringify(user!=null)}</p>
        <p>user: {JSON.stringify(user)}</p>
        <p>userLoading: {JSON.stringify(loadingUser)}</p>
        <p>userError: {JSON.stringify(userError)}</p>

    </div>

};

export default TestDB