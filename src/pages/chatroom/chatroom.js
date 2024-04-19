import { useParams,Link } from "react-router-dom"
import { database,auth } from "firebaseConfig/firebase"
import { ref,set,onDisconnect,remove,onValue } from "firebase/database"
import { useObject } from "react-firebase-hooks/database"
import { useAuthState } from "react-firebase-hooks/auth"
import React, {  useState,useEffect } from 'react';
const Chatroom = ()=>{
    const {friendID} = useParams()
    const [IDisRight, setIDisRight] = useState(false)
    const [user,loadingUser,userError] = useAuthState(auth)
    const [messages,setMessages] = useState([])
    const [currentMessage, setCurrentMessage] = useState("")
    // const [existentIDs, setExistentIDs] = useState([])
    const existentIDs = new Set();
    const [effectCounter, setEffectCounter] = useState(0)
    const conversationPartnerRef = 
        user?ref( database,`Users/${user.uid}/CurrentConversation/friend`):null
        /* here we are getting data from the conversation partner of the user to 
        make sure that he is the same as the friendID from the URL. If it isn't,
        the we will have to throw an error. */

    const [friendSnapshot,loadingSnapshotFriend,friendSnapshotError] = 
    useObject(conversationPartnerRef)
    
    const currentConversation = user? ref(database,`Users/${user.uid}/CurrentConversation`):null
    const [userInConvo, loadingUserInConvo, errorUserInConvo] = useObject(currentConversation)

    useEffect(()=>{
        if(!user||!friendSnapshot)return
        setIDisRight(friendSnapshot.val()===friendID)
        //verifying that the ID in the URL really is the friend's ID.
    },[user,friendSnapshot])

    useEffect(()=>{
        if(!user)return
        onDisconnect(currentConversation).remove()
        
        return ()=>{
            console.log('cleaning up')
        }
    }, []);

    useEffect(()=>{ /* get data from friend's message */
        if(!user)return
        setEffectCounter()
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
                setMessages(prevMessages => [message,...prevMessages])
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
            setMessages(prevMessages=>[{
                id:messageID,
                dateCreated:currentDate.getTime(),
                content:text,
                sender:user.uid,
                },...prevMessages]);
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

    const forDate = (arr)=>{
        /* sorts an array such as
    [{dateCreated: 1713, name: 'mike'},
    {dateCreated: 172, name: 'tyson'},
    {dateCreated: 100, name: 'Bruno'}] in ascending order*/
    arr.sort((a,b)=>
        b.dateCreated-a.dateCreated
    )
    return arr
}

    return <div>
        {(loadingUser||loadingSnapshotFriend)&&<p>loading…</p>}
        {(!IDisRight)&&
            <div>
                <p>wrong URL bro</p>
                <Link to="/chat">back home?</Link> 

            </div>
        }
        {(friendSnapshotError||userError)&& 
            <section>
                <p>looks like something went wrong.</p>
                <Link to="/chat">Go back home</Link> 
            </section>}
        
        {(user&&friendSnapshot&&userInConvo&&IDisRight)&&
        <div>
            <p>welcome to chat room, {user.uid}</p>
            <form onSubmit={async(e)=>{
                e.preventDefault()
                await sendMessage(currentMessage)
            }}>
                <input onChange={(e)=>{
                    setCurrentMessage(e.target.value)
                }}></input>
                <button type="submit">Send</button>
            </form>
            <ul reversed>
                {messages.map((messageObject)=>(
                    messageObject.sender===user.uid?
                    <li key={messageObject.id}>{messageObject.content}</li>:
                    <li key={messageObject.id} style={{color:"red"}} >{messageObject.content}</li>

                ))}
            </ul>
            <button onClick={()=>{
                console.log(messages)
            }}>messages?</button>
            <Link to={'/chat'}>go back</Link>
        </div>
        
        
        }

    </div>
}
export default Chatroom

