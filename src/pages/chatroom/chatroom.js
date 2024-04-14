import { useParams } from "react-router-dom"
import { database,auth } from "firebaseConfig/firebase"
import { ref } from "firebase/database"
import { useObject } from "react-firebase-hooks/database"
import { useAuthState } from "react-firebase-hooks/auth"
import React, {  useState,useEffect } from 'react';
const Chatroom = ()=>{
    const {friendID} = useParams()
    const friendUserDocRef = ref(database,`Users/${friendID}`)
    const [snapshot,loading,error] = useObject(friendUserDocRef)
    const [friendName,setFriendName] = useState("")
    const [user,loadingUser,userError] = useAuthState(auth)

    useEffect(()=>{
        if(user&&snapshot){
            /* snapshot.val() = {"dateCreated":1713094084929,"username":"yian"} */
            
            setFriendName(snapshot.val().username)
        }
    },[snapshot])

    return <div>
        {loading&&<p>loading…</p>}
        {snapshot&& <div>you are speaking to {JSON.stringify(friendName)}</div> }

    </div>
}
export default Chatroom