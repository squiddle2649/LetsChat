import './testStyling.css'
import React, {useState,useEffect,useContext } from 'react';
import { useAuthState } from "react-firebase-hooks/auth"
import { ref,get,update} from 'firebase/database';
import { database,auth } from 'firebaseConfig/firebase';

const  TestPage = () => {
    const [messageContent,setMessageContent] = useState("")
    const userID = "9X8oqSDo3Je1iZhmuxYa2Cwnz3H3"
    const friendID = "YzV6dl6VsdY2AACYadwJQXcHRuk2"
    const [user,loadingUser,userError] = useAuthState(auth)

    const messageRef = ref(database,`Users/${friendID}/CurrentConversation/Messages/eTfgqKBTf7WBVzYO4YZH`)

    const getMessage = async()=>{
        try{
            const messageSnapshot = await get(messageRef)
            const message = messageSnapshot.val()['content']
            setMessageContent(JSON.stringify(message))
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
        <h2>Message:</h2>
        <h3>{messageContent}</h3>
        <button 
            style={{
            marginTop:"100px"
        }}
            onClick={getMessage}
        >get message yo</button>
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



export default TestPage