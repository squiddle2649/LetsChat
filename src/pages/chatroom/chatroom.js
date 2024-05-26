import { useParams,Link } from "react-router-dom"
import { database,auth } from "firebaseConfig/firebase"
import { ref, set,onDisconnect,onValue, remove,update } from "firebase/database"
import { useObject } from "react-firebase-hooks/database"
import { useAuthState } from "react-firebase-hooks/auth"
import React, {  useState,useEffect,useRef,createContext } from 'react';
import './chatroomStyling.css?'
import 'components/generalStyling/main.css'
import { House,Send} from "./chatroomSVG"
import LoadingScreen from "components/loadingScreen/loadingScreen"
import { MessagesList } from "./messages/messagesList"
import { ErrorScreen } from "./errorScreen"
export const ChatroomContext = createContext()


const Chatroom = ()=>{
    const {friendID} = useParams()
    const [IDisRight, setIDisRight] = useState(true)
    const [user,loadingUser,userError] = useAuthState(auth)
    const [messages,setMessages] = useState([])
    const [currentMessage, setCurrentMessage] = useState("")
    const [username, setUsername] = useState(null)    
    const [friendName, setFriendName] = useState(null)    
    const [friendOffline, setFriendOffline] = useState(false)
    const existentIDs = new Set();
    const unReadMessages = new Set();
    
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
        /* here we are getting the ID of the conversation partner in the user's
        'CurrentConversation' collection to make sure that he is the same as the
        friendID from the URL. If it isn't, then we will have to throw an error. */

    const [friendSnapshot,loadingSnapshotFriend,friendSnapshotError] = 
    useObject(conversationPartnerRef)
    
    
    const friendNameRef = IDisRight?ref(database,`Users/${friendID}/username`):null
    const [friendNameSnap, loadingFriendName, friendNameError] = useObject(friendNameRef)
    
    let setupError = (friendSnapshotError||
        userError||
        !IDisRight||
        friendNameError||
        usernameError)/* &&!friendNameSnap */
    const setupLoading = IDisRight===`loading`||loadingUser||loadingUsername||loadingSnapshotFriend||loadingFriendName

    useEffect(()=>{
        if(!IDisRight||!friendNameSnap)return
        setFriendName(friendNameSnap.val())
    },[IDisRight,friendNameSnap])

    const [mesagesReceived, setMessagesReceived] = []

    const setOnline = async(ref)=>{
        try{
            await update(ref,{userOffline:false})
        }
        catch(err){
            alert(err.message)
        }
    }

    useEffect(()=>{
        const setupDisconnect = ()=>{
            if(!user)return
            const currentConversation = ref(database,`Users/${user.uid}/CurrentConversation`)
            onDisconnect(currentConversation).update({userOffline:true})
            /* remove currentConversation subcollection from the user's document
            when he disconnects. */
        }
        
        return ()=>{
            setupDisconnect()
        }
    }, [user]);

    // useEffect(()=>{
    //     // console.log(JSON.stringify(friendNameSnap))
    // },[friendNameSnap])

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
        if(!IDisRight)return
        const friendConvoRef = ref(database, `Users/${friendID}/CurrentConversation`)

        const unsubscribe = onValue(friendConvoRef,(snapshot)=>{
            const friendIsOffline = snapshot.val()["userOffline"]
            setFriendOffline(friendIsOffline)
        })
        return ()=>{
            unsubscribe()    
        }
    },[])

    const isScrolledToBottom = () => {

        if (!chatroomRef.current) return false; // Handle missing ref
        
        const scrollTop = chatroomRef.current.scrollTop;
        const scrollHeight = chatroomRef.current.scrollHeight;
        const clientHeight = chatroomRef.current.clientHeight;
        if(scrollHeight===clientHeight)return true
        
        // Check if scrolled to the bottom considering potential content padding
        return scrollTop + clientHeight >= scrollHeight;
    }

    useEffect(()=>{ /* get data from friend's message */
        const friendMessagesRef = ref(database, `Users/${friendID}/CurrentConversation/Messages`)
        const unsubscribe = onValue(friendMessagesRef,(messageSnapshot)=>{
            if(!messageSnapshot.exists()){
                setReceivedMessages(prevMessages => [...prevMessages,"friend"])
                return
            }
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

            /* 
                [
                    {id:'elfisu',dateCreated:12},
                    {id:'almina',dateCreated:21},
                    {id:'liuse',dateCreated:2}
                ]
            */
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
            setReceivedMessages(prevMessages => [...prevMessages,"friend"])

        })
        return()=>{
            unsubscribe() 
        }
    },[])

    useEffect(()=>{ /* loading the user's own messages */
        if(!user)return
        const userMessagesRef = ref(database, `Users/${user.uid}/CurrentConversation/Messages`)
        const unsubscribe=onValue(userMessagesRef,(messageSnapshot)=>{
            if(!messageSnapshot.exists()){
                setReceivedMessages(prevMessages => [...prevMessages,"user"])    
                return
            }
            const messagesData = messageSnapshot.val()
            const messageIDs = Object.keys(messagesData)

            const messagesArray = messageIDs.map(key => ({
                id: key,
                dateCreated: messagesData[key].dateCreated,
                content: messagesData[key].content,
                sender:user.uid
            }));
            
            messagesArray.forEach((message)=>{
                if(existentIDs.has(message.id))return
                setMessages(prevMessages => [...prevMessages,message])
                existentIDs.add(message.id)
            }) 
            setReceivedMessages(prevMessages => [...prevMessages,"user"])    
        })
        return()=>{
            unsubscribe()
        }
    },[user])
    
    const [receivedMessages, setReceivedMessages] = useState([])
    const [scrolledToBottom,setScrolledToBottom] = useState(true)
    const [unreadMessages,setUnreadMessages] = useState([])

    useEffect(() => {
        const handleScroll = () => {
            setScrolledToBottom(isScrolledToBottom())
        }
        
        if(!chatroomRef.current)return
        chatroomRef.current.addEventListener('scroll', handleScroll);

        return () => {
            if(!chatroomRef.current)return
            chatroomRef.current.removeEventListener('scroll', handleScroll);
        };
    }, [chatroomRef.current])

    useEffect(() => {
        /* This useEffect hook makes sure that the users are 
        scrolled all the way to the bottom when the component
        loads */
        if (!chatroomRef.current||!messages[0])return
        messages.sort((a, b) => a.dateCreated - b.dateCreated);
        if(receivedMessages.length>2)return
        /* once the snapshot for the user's messages is in place,
        it will push the string "user message received" to this 
        receivedMessages array. And same thing for the friend's messages.
        This ensures that the initial scroll only happens once the previous
        messages are all setup. */
        chatroomRef.current.scrollTop = chatroomRef.current.scrollHeight;
      }, [receivedMessages,messages]);

    const sendMessage = async(text)=>{
        const messageID = generateRandomKey(20)
        const userMessagesRef = ref(database, `Users/${user.uid}/CurrentConversation/Messages/${messageID}`)
        const currentDate = new Date()
        const messageObject = {
            dateCreated:currentDate.getTime(),
            content:text,
          }
        /* this is the message document that will be added to the messages
        collection (userMessagesRef). This doesn't have the attribute ID
        because the document itself is an ID */
        try{
            await set(userMessagesRef,messageObject)  
        }
        catch(err){
            alert(err.message)
        }
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
        generateRandomKey:generateRandomKey,
        chatroomRef:chatroomRef,
        scrolledToBottom:scrolledToBottom,
        unreadMessages:unreadMessages,
        setUnreadMessages:setUnreadMessages
        
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
        {(setupLoading)&&
            <LoadingScreen></LoadingScreen>
        }
        {setupError&& 
        /* the variable friendSnapshotError means something is wrong with the path 
        'Users/user.uid/CurrentConversation/friend'*/
            <ErrorScreen></ErrorScreen>
        }
        
        {(IDisRight&&user&&!friendNameError)&&
            <div style={{height:"100%",width:"100%"}} className="flexCenter flexColumn">
                <p>{JSON.stringify(unreadMessages)}</p>
                <button onClick={()=>{
                    console.log(scrolledToBottom)
                }}>scrolled to bottom</button>
                <button onClick={()=>{
                    console.log(chatroomRef.current)
                }}>chatroom?</button>
                <div className="chatHeader flexLeft redBG">
                    <Link to={'/chat'}> <House></House> </Link>
                    <div className="vl"></div>
                    <h2 className=" whiteText" style={{marginLeft:'18px'}}>
                        You are speaking to {friendName} 
                        {friendOffline&& " (user disconnected)"}
                     </h2>
                     {unreadMessages.length>=1&& 
                        <div className="notificationContainer"
                             onClick={()=>{
                                scrollToBottom(chatroomRef.current)
                             }}>
                            <div className="notification whiteText">
                                {unreadMessages.length} unread messages
                            </div>
                        </div>}
                </div>
                    <div ref={chatroomRef}  className="chatroom" id="chatroom">
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
                                <div className="sendButtonContainer flexCenter">
                                    <button type="submit" className="sendButton redBGhover pointer noBorder"> <Send></Send> </button>
                                </div>
                            </form>
                        </div>
            </div>
             
        } 
    </div>
}
export default Chatroom

