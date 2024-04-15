import { useParams,Link } from "react-router-dom"
import { database,auth } from "firebaseConfig/firebase"
import { ref,set,onDisconnect,remove } from "firebase/database"
import { useObject } from "react-firebase-hooks/database"
import { useAuthState } from "react-firebase-hooks/auth"
import React, {  useState,useEffect } from 'react';
const Chatroom = ()=>{
    const {friendID} = useParams()
    const [IDisRight, setIDisRight] = useState(true)
    const[user,loadingUser,userError] = useAuthState(auth)
    const [messages,setMessages] = useState([])
    const conversationPartnerRef = 
        user?ref( database,`Users/${user.uid}/CurrentConversation/friend`):null
        /* here we are getting data from the conversation partner of the user to 
        make sure that he is the same as the friendID from the URL. If it isn't,
        the we will have to throw an error. */

    const [friendSnapshot,loadingSnapshotFriend,friendSnapshotError] = 
    useObject(conversationPartnerRef)

    const [messageSnapshot,loadingSnapshotMessage,messageSnapshotError] = 
    useObject(conversationPartnerRef)
    

    useEffect(()=>{
        if(!user||!friendSnapshot)return
        setIDisRight(friendSnapshot.val()===friendID)
    },[user,friendSnapshot])

    useEffect(()=>{
        if(!user)return
        const userInQueueRef = ref(database,`Users/${user.uid}/CurrentConversation`)
        onDisconnect(userInQueueRef).remove()

        return ()=>{
            console.log('cleaning up')
        }
    }, []);

    useEffect(()=>{
        const messagesRef = ref(database, `Users/${friendID}/CurrentConversations`)
        const unsubscribe = onValue(messagesRef,(messageSnapshot)=>{
            
        })
        return()=>{
            unsubscribe()
        }
        

    },[])

    return <div>
        {(loadingUser||loadingSnapshotFriend)&&<p>loading…</p>}
        {(friendSnapshotError||userError||!IDisRight)&& 
            <section>
                <p>looks like something went wrong.</p>
                <Link to="/chat">Go back home</Link> 
            </section>}
        
        {(user&&friendSnapshot)&&
        <div>
            <p>welcome to chat room</p>
            <ul>
                {messages.map((message)=>(
                    sender===user.uid?
                    <li>message.text</li>:
                    <li style={{color:'red'}}>message.text</li>
                ))}
            </ul>
        </div>
        
        
        }

    </div>
}
export default Chatroom