import { useParams,Link } from "react-router-dom"
import { database,auth } from "firebaseConfig/firebase"
import { ref, set,onDisconnect,onValue,get, remove,update } from "firebase/database"
import { useObject } from "react-firebase-hooks/database"
import { useAuthState } from "react-firebase-hooks/auth"
import React, {  useState,useEffect,useRef,createContext } from 'react';
import './chatroomStyling.css?'
import 'components/generalStyling/main.css'
import { House,Send} from "./chatroomSVG"
import LoadingScreen from "components/loadingScreen/loadingScreen"
import { MessagesList } from "./messages/messagesList"
export const ChatroomContext = createContext()


const Chatroom = ()=>{
    const {friendID} = useParams()
    const [IDisRight, setIDisRight] = useState(true)
    const [user,loadingUser,userError] = useAuthState(auth)
    const [messages,setMessages] = useState([])
    const [currentMessage, setCurrentMessage] = useState("")
    const [username, setUsername] = useState("louis")    
    const [friendName, setFriendName] = useState("thomas")    
    const [friendOffline, setFriendOffline] = useState(false)

    const existentIDs = new Set();
    
    const chatroomRef = useRef(null)
    const messageInputRef = useRef(null)

    const scrollToBottom = (element)=>{
        if(user&&IDisRight)
        element.scrollTo({
            top:element.scrollHeight,
            left: 0,
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
    },[IDisRight,friendNameSnap])

    const setOnline = async(ref)=>{
        try{
            await update(ref,{userOffline:false})
        }
        catch(err){
            alert(err.message)
        }
    }

    useEffect(()=>{
        if(!user||!friendSnapshot||!usernameSnapshot)return
        /* If the user or the friendsnapshot isn't ready, then just return */
        /* REMEMBER: FriendSnapshot is the ID of the friend written in the
        user's own CurrentConversation collection */
        setUsername(usernameSnapshot.val())
        setIDisRight(friendSnapshot.val()===friendID)
        const currentConversation = ref(database,`Users/${user.uid}/CurrentConversation`)
        if(IDisRight){
            setOnline(currentConversation)
        }

        //verifying that the ID in the URL really is the friend's ID.
    },[user,friendSnapshot,usernameSnapshot])

    

    useEffect(()=>{
        if(!user)return
        const currentConversation = ref(database,`Users/${user.uid}/CurrentConversation`)
        onDisconnect(currentConversation).update({userOffline:true})
        /* remove currentConversation subcollection from the user's document
        when he disconnects. */
        
        return ()=>{
            console.log('cleaning up')
        }
    }, []);



    // useEffect(()=>{
    //     const friendConvoRef = ref(database, `Users/${friendID}/CurrentConversation`)
    //     /* we are only able to tell if the user has disconnected from the convo,
    //     so we have to listen to the currentConversation subcolleciton in the friend's
    //     document to make sure that it's still existent.  */
    //     const unsubscribe = onValue(friendConvoRef,(snapshot)=>{
    //         if(!snapshot.exists()){
    //             /* If it suddenly disappears, then we know that the friend
    //             is disconnected and we respond accordingly. */
    //             setFriendDisconnected(true)
    //             return
    //         }
    //         else{
    //             setFriendDisconnected(false)
    //         }
    //     })
    //     return()=>{
    //         unsubscribe() 
    //     }
    // },[])


    useEffect(()=>{
        if(!IDisRight)return
        const friendConvoRef = ref(database, `Users/${friendID}/CurrentConversation`)

        const unsubscribe = ()=>{
            onValue(friendConvoRef,(snapshot)=>{
                const friendIsOffline = snapshot.val()["userOffline"]
                setFriendOffline(friendIsOffline)

            })
        }
        return ()=>{
            unsubscribe()    
        }
    },[])

    useEffect(()=>{ /* get data from friend's message */
        const friendMessagesRef = ref(database, `Users/${friendID}/CurrentConversation/Messages`)
        const unsubscribe = onValue(friendMessagesRef,(messageSnapshot)=>{
            if(!messageSnapshot.exists())return
            const messagesData = messageSnapshot.val()
            /* format of messagesData:
                {
                    "l31g41yk":{content:"hi",dateCreated:123},
                    "l31g41yk":{content:"hello",dateCreated:886},
                }
            */
            const messageIDs = Object.keys(messagesData)
            /* messageIDs is an array with the messages ID 
            of the other user: messageIDs = ["l31g41yk","l31g41yk"] */

            const messagesArray = messageIDs.map(key => ({
                id: key,
                dateCreated: messagesData[key].dateCreated,
                content: messagesData[key].content,
                sender:friendID
              }));

            messagesArray.forEach((message)=>{
                if(existentIDs.has(message.id))return
                /* whenever we get the messagesArray, we get a list of all
                the friend's messages. Some of these messages, however, are
                already being displayed, so we add all the ids to a javascript
                Set (which doesn't allow duplicates) and only display a message
                if it's ID isn't already in the Set*/
                setMessages(prevMessages => [...prevMessages,message])
                existentIDs.add(message.id)
            }) 

        })
        return()=>{
            unsubscribe() 
        }
        

    },[])
    useEffect(()=>{
        scrollToBottom(chatroomRef.current)
        /* whenever a new message gets added, we scroll to bottom */
    },[messages])

    const sendMessage = async(text)=>{
        const messageID = generateRandomKey(20)
        const userMessagesRef = ref(database, `Users/${user.uid}/CurrentConversation/Messages/${messageID}`)
        const currentDate = new Date()
        const messageObject = {
            dateCreated:currentDate.getTime(),
            content:text,
            // messageRecipient:friendID
          }
        /* this is the message document that will be added to the messages
        collection (userMessagesRef). This doesn't have the attribute ID
        because the document itself is an ID */
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
        // finally{
        //     scrollToBottom(chatroomRef.current)
        // }

    }

    

    const resetMessages = async()=>{
        /* This is just for convenience: sometimes when testing the code,
        the chatroom gets full of messages and I need to just reset everything*/
        const friendMessagesRef = ref(database, `Users/${friendID}/CurrentConversation/Messages`)
        const myMessagesRef = ref(database, `Users/${user.uid}/CurrentConversation/Messages`)
        try{
            await remove(friendMessagesRef)
            await remove(myMessagesRef)
            setMessages([])
        }
        catch(err){
            alert(err.message)
        }
    }

    const generateRandomKey=(length)=> {
        /* genearting a random ID for each message */
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
    const chatroomContextVal = {
        messages:messages,
        user:user,
        friendName:friendName,
        username:username,
        friendID:friendID,
        generateRandomKey:generateRandomKey
        /* this information has to be communicated to the MessagesList component
        through a context provider */
    }

    const errorCheck = ()=>{
        console.log(`friendsnapshot error: ${friendSnapshotError}`)
        console.log(`id correct?: ${IDisRight}`)
        console.log(`userError: ${userError}`)
        console.log(`friend name erro: ${friendNameError}`)
    }

    return <div className="chatroomContainer arial ">
        {(IDisRight===`loading`||loadingUser||loadingSnapshotFriend||loadingFriendName)&&
            <LoadingScreen></LoadingScreen>
        }
        {((friendSnapshotError||userError||!IDisRight||friendNameError))&& 
        /* the variable friendSnapshotError means something is wrong with the path 
        'Users/user.uid/CurrentConversation/friend'*/
        <div className='arial flexCenter flexColumn errorPageContainer'>
        <div class="flexCenter" >
            <h1 style={{marginBottom:"0"}}>🙃</h1>
            <h2 style={{marginBottom:"0"}}>Whoops</h2>
        </div>
        <h3>It looks like something's gone wrong…</h3>
        <Link to={"/chat"}>Take me home</Link>
    </div>
        }
        

        {(IDisRight&&user&&!friendNameError)&&
            <div style={{height:"100%",width:"100%"}} className="flexCenter flexColumn">
                <div className="chatHeader flexLeft redBG">
                    <Link to={'/chat'}> <House></House> </Link>
                    <div className="vl"></div>
                    <h2 className="arial-bold tight whiteText" style={{marginLeft:'18px'}}>
                        You are speaking to {friendName} 
                        {friendOffline&& " (user disconnected)"}
                     </h2>
                </div>
                    <div ref={chatroomRef}  className="chatroom">
                        <ChatroomContext.Provider value={chatroomContextVal}>
                            <MessagesList></MessagesList>
                        </ChatroomContext.Provider>
                    </div>
                        <div className="formContainer flexCenter">
                            <form className="messageForm redBG" onSubmit={async(e)=>{
                                e.preventDefault()
                                messageInputRef.current.value = ""
                                if(currentMessage==="")return
                                await sendMessage(currentMessage)
                                setCurrentMessage("")

                            }}>
                                <input 
                                    ref ={messageInputRef} 
                                    className="messageInput redBG" 
                                    placeholder={`Message ${friendName}`}
                                    onChange={(e)=>{
                                    setCurrentMessage(e.target.value)
                                }}>
                                    
                                </input>
                                <button type="submit" className="sendButton redBGhover pointer noBorder"> <Send></Send> </button>
                            </form>
                        </div>
            </div>
             
        } 
    </div>
}
export default Chatroom

