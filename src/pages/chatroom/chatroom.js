import { useParams,Link } from "react-router-dom"
import { database,auth } from "firebaseConfig/firebase"
import { ref,set } from "firebase/database"
import { useObject } from "react-firebase-hooks/database"
import { useAuthState } from "react-firebase-hooks/auth"
import React, {  useState,useEffect } from 'react';
const Chatroom = ()=>{
    const {friendID} = useParams()
    const [IDisRight, setIDisRight] = useState(true)
    const[user,loadingUser,userError] = useAuthState(auth)
    const conversationPartnerRef = 
        user?ref( database,`Users/${user.uid}/CurrentConversation/friend`):null
        /* here we are getting data from the conversation partner of the user to 
        make sure that he is the same as the friendID from the URL. If it isn't,
        the we will have to throw an error. */

    const [snapshot,loadingSnapshot,snapshotError] = useObject(conversationPartnerRef)

    useEffect(()=>{
        if(!user||!snapshot)return
        setIDisRight(snapshot.val()===friendID)
    },[user,snapshot])


    return <div>
        {(loadingUser||loadingSnapshot)&&<p>loading…</p>}
        {(snapshotError||userError||!IDisRight)&& 
            <section>
                <p>looks like something went wrong.</p>
                <Link to="/chat">Go back home</Link> 
            </section>}
        {/* {snapshot&& <div>you are speaking to {JSON.stringify(friendName)}</div> }
        {(userError)&&<p>Something went wrong…</p>} */}
        <p>welcome to chat room</p>
    </div>
}
export default Chatroom