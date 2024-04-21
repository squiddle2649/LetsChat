import { useParams,Link } from "react-router-dom"
import { database,auth } from "firebaseConfig/firebase"
import { ref,set,onDisconnect,onValue,get } from "firebase/database"
import { useObject } from "react-firebase-hooks/database"
import { useAuthState } from "react-firebase-hooks/auth"
import React, {  useState,useEffect,useRef } from 'react';
import './chatroomStyling.css'



const Chatroom = ()=>{
    const {friendID} = useParams()
    const [IDisRight, setIDisRight] = useState(`loading`)
    const [user,loadingUser,userError] = useAuthState(auth)
    const [messages,setMessages] = useState([])
    const [friendDisconnected,setFriendDisconnected] = useState(false)
    const [currentMessage, setCurrentMessage] = useState("")
    const [username, setUsername] = useState(null)    
    const [friendName, setFriendName] = useState(null)    
    const existentIDs = new Set();
    
    const chatroomRef = useRef(null)
    const messageInputRef = useRef(null)
    const scrollToBottom = (element)=>{
        element.scrollTo({
            top:element.scrollHeight,
            left: 0,
            behavior: 'smooth'
        })

    }


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
    
    
    const friendNameRef = IDisRight?ref(database,`Users/${friendID}/username`):null
    const [friendNameSnap, loadingFriendName, friendNameError] = useObject(friendNameRef)
    
    useEffect(()=>{
        if(!IDisRight||!friendNameSnap)return
        setFriendName(friendNameSnap.val())
    })

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
        const currentConversation = ref(database,`Users/${user.uid}/CurrentConversation`)
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
            await set(userMessagesRef,messageObject)  
            if(existentIDs.has(messageID))return
            setMessages(prevMessages=>[...prevMessages,{
                id:messageID,
                dateCreated:currentDate.getTime(),
                content:text,
                sender:user.uid,
                }]);
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
    return <div className="chatroomContainer arial-italic">
        <Link to={'/chat'}><h2 style={{marginTop:'0'}}>GO BACK</h2></Link>
        {(friendDisconnected)&&<p>looks like your friend has disconnected</p>}
            
        {(friendSnapshotError)&&<p>friend disconnected?</p>}
        
        
        
        {(IDisRight===`loading`||loadingUser||loadingSnapshotFriend||loadingFriendName)&&<p>loading…</p>}
        {(friendSnapshotError||userError||!IDisRight||friendNameError)&& 
        /* friendSnapshotError means something is wrong with the path 
        'Users/user.uid/CurrentConversation/friend'*/
            <section>
                <p>looks like something went wrong.</p>
            </section>}

        {(IDisRight&&user)&&

            <div style={{height:"100%",width:"100%"}}>
                <h1 /* style={{marginBottom:"0"}} */>Welcome to chatroom, {username}</h1>
                <h3>You are talking to, {friendName}</h3>
                    <div ref={chatroomRef}  className="chatroom">
                
                        <ul className="listOfMessages" reversed>
                            {messages.map((messageObject)=>(
                                <Message
                                    username={messageObject.sender===user.uid?
                                        username:friendName
                                    }
                                    key={messageObject.id}
                                    content={messageObject.content}
                                    me={messageObject.sender===user.uid}
                                ></Message>
                                // messageObject.sender===user.uid?
                                // <li key={messageObject.id}><h1>{messageObject.content}</h1></li>:
                                // <li key={messageObject.id} style={{color:"aqua"}} ><h1>{messageObject.content}</h1></li>
                            ))}
                        </ul>
                    </div>
                        <div className="formContainer flexCenter">
                            <form className="messageForm " onSubmit={async(e)=>{
                                e.preventDefault()
                                messageInputRef.current.value = ""
                                await sendMessage(currentMessage)
                                scrollToBottom(chatroomRef.current)
                            }}>
                                <input ref ={messageInputRef} className="messageInput" onChange={(e)=>{
                                    setCurrentMessage(e.target.value)
                                }}></input>
                                <button type="submit">Send</button>
                            </form>
                        </div>
            </div>
            
        
        
        } 

    </div>
}
export default Chatroom

const Message = (props)=>{
    return <div className="arial flexColumn">
    <p className="username arial-bold" style={{
        color: props.me?"#59b7db":"#cd4e67"
    }}>{props.username}</p>
    <h3 className="messageText">{props.content}</h3>
</div>
}