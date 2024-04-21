import { useParams,Link } from "react-router-dom"
import { database,auth } from "firebaseConfig/firebase"
import { ref,set,onDisconnect,onValue } from "firebase/database"
import { useObject } from "react-firebase-hooks/database"
import { useAuthState } from "react-firebase-hooks/auth"
import React, {  useState,useEffect } from 'react';
import './chatroomStyling.css'

const Chatroom = ()=>{
    const {friendID} = useParams()
    const [IDisRight, setIDisRight] = useState(`loading`)
    const [user,loadingUser,userError] = useAuthState(auth)
    const [messages,setMessages] = useState([])
    const [friendDisconnected,setFriendDisconnected] = useState(false)
    const [currentMessage, setCurrentMessage] = useState("")
    const [username, setUsername] = useState(null)    
    const existentIDs = new Set();

    const usernameRef = 
        user?ref( database,`Users/${user.uid}/username`):null
    const [usernameSnapshot,loadingUsername,usernameError] = 
    useObject(usernameRef)

    const conversationPartnerRef = 
        user?ref( database,`Users/${user.uid}/CurrentConversation/friend`):null
        /* here we are getting data about the conversation partner in the user's
        'CurrentConversation' collection to make sure that he is the same as the
        friendID from the URL. If it isn't, then we will have to throw an error. */

    const [friendSnapshot,loadingSnapshotFriend,friendSnapshotError] = 
    useObject(conversationPartnerRef)
    
    const currentConversation = user? ref(database,`Users/${user.uid}/CurrentConversation`):null

    useEffect(()=>{
        if(!user||!friendSnapshot||!usernameSnapshot)return
        /* If the user or the friendsnapshot isn't ready, then just return */
        /* REMEMBER: FriendSnapshot is the ID of the friend written in the
        user's own CurrentConversation collection */
        setUsername(usernameSnapshot.val())
        setIDisRight(friendSnapshot.val()===friendID)

        //verifying that the ID in the URL really is the friend's ID.
    },[user,friendSnapshot,usernameSnapshot])

    useEffect(()=>{
        if(!user)return
        onDisconnect(currentConversation).remove()
        
        return ()=>{
            console.log('cleaning up')
        }
    }, []);

    useEffect(()=>{
        const friendConvoRef = ref(database, `Users/${friendID}/CurrentConversation`)
        const unsubscribe = onValue(friendConvoRef,(snapshot)=>{
            if(!snapshot.exists()){
                setFriendDisconnected(true)
                return
            }
            else{
                setFriendDisconnected(false)
            }
        })
        return()=>{
            unsubscribe() 
        }
    })

    useEffect(()=>{ /* get data from friend's message */
        const friendMessagesRef = ref(database, `Users/${friendID}/CurrentConversation/Messages`)
        const unsubscribe = onValue(friendMessagesRef,(messageSnapshot)=>{
            if(!messageSnapshot.exists())return
            const messagesData = messageSnapshot.val()
            const messageIDs = Object.keys(messagesData)
            
            const messagesArray = messageIDs.map(key => ({
                id: key,
                dateCreated: messagesData[key].dateCreated,
                content: messagesData[key].content,
                sender:friendID
              }));

            messagesArray.forEach((message)=>{
                if(existentIDs.has(message.id))return
                setMessages(prevMessages => [...prevMessages,message])
                existentIDs.add(message.id)
            }) 

        })
        return()=>{
            unsubscribe() 
        }
        

    },[])

    const sendMessage = async(text)=>{
        const messageID = generateRandomKey(20)
        const userMessagesRef = ref(database, `Users/${user.uid}/CurrentConversation/Messages/${messageID}`)
        const currentDate = new Date()
        const messageObject = {
            dateCreated:currentDate.getTime(),
            content:text
          }
        try{
            // await set(userMessagesRef,messageObject)  
            if(existentIDs.has(messageID))return
            setMessages(prevMessages=>[...prevMessages,{
                id:messageID,
                dateCreated:currentDate.getTime(),
                content:text,
                sender:user.uid,
                }]);
            // setExistentIDs(prevIDs=>[...prevIDs,messageID])
            existentIDs.add(messageID)

        }
        catch(err){
            alert(err.message)
        }

    }

    const generateRandomKey=(length)=> {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
    return <div className="chatroomContainer ">
        <Link to={'/chat'}>go back</Link>
            {/* {(friendDisconnected)&&<p>looks like your friend has disconnected</p>}
            <p>welcome to chat room, {username}</p>
            {(friendSnapshotError)&&<p>friend disconnected?</p>}
        {(IDisRight===`loading`||loadingUser||loadingSnapshotFriend)&&<p>loading…</p>}
        {(friendSnapshotError||userError||!IDisRight)&&  */}
         {/* friendSnapshotError means something is wrong with the path 
        'Users/user.uid/CurrentConversation/friend' */}
            {/* <section>
                <p>looks like something went wrong.</p>
                <Link to="/chat">Go back home</Link> 
            </section>}
        
        {(IDisRight&&user)&& */}


            
            <div className="chatroom flexCenter red">
                
                <ul className="listOfMessages" reversed>
                    {messages.map((messageObject)=>(
                        messageObject.sender===user.uid?
                        <li key={messageObject.id}><h1>{messageObject.content}</h1></li>:
                        <li key={messageObject.id} style={{color:"red"}} ><h1>{messageObject.content}</h1></li>
                    ))}
                </ul>
            </div>
                <form className="messageForm red" onSubmit={async(e)=>{
                    e.preventDefault()
                    await sendMessage(currentMessage)
                }}>
                    <input className="messageInput" onChange={(e)=>{
                        setCurrentMessage(e.target.value)
                    }}></input>
                    <button type="submit">Send</button>
                </form>
        
        
    {/* } */}

    </div>
}
export default Chatroom

