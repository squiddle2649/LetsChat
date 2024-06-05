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
    const [messages,setMessages] = useState([])
    const [currentMessage, setCurrentMessage] = useState("")
    const [username, setUsername] = useState(null)    
    const [friendName, setFriendName] = useState(null)    
    const [friendOffline, setFriendOffline] = useState(false)
    const existentIDs = new Set();
    
    const chatroomRef = useRef(null)
    const messageInputRef = useRef(null)

    const scrollToBottom = (element)=>{
        element.scrollTo({
            top:element.scrollHeight,
            left: 0,
        })
    }
    const scrambleStrings = (str1, str2) =>{
        
        /* This function scrambles two strings in a specific way to produce a consistent output.
      
        Args:
            str1: The first string to be scrambled.
            str2: The second string to be scrambled.
      
        Returns:
            A string representing the scrambled combination of the two inputs. */
        
      
        // Combine the strings
        const combinedString = str1 + str2;
      
        // Sort the characters
        const sortedChars = combinedString.split("").sort();
      
        // Interleave characters from each string
        let scrambledString = "";
        for (let i = 0; i < combinedString.length; i++) {
          if (i % 2 === 0) {
            scrambledString += sortedChars[Math.floor(i / 2)];
          } else {
            scrambledString += sortedChars[Math.floor(combinedString.length / 2) + Math.floor(i / 2)];
          }
        }
      
        return scrambledString;
    }
    

    const [user,loadingUser,userError] = useAuthState(auth)

    const convoID = user?scrambleStrings(user.uid,friendID):null

    useEffect(()=>{
        if(!user)return
        const markConvo = async()=>{
            const currentConvoRef = ref(database,`Users/${user.uid}`)
            try{
                await update(currentConvoRef,{currentConversation:convoID})
            }
            catch(err){
                console.log(err.message)
            }
        }
        return()=>{
            markConvo()
        }
    },[user])

    const usernameRef = user?ref( database,`Conversations/${convoID}/${user.uid}/username`):null
    const [usernameSnapshot,loadingUsername,usernameError] = 
    useObject(usernameRef)

    const friendNameRef = ref( database,`Conversations/${convoID}/${friendID}/username`)
    const [friendNameSnap, loadingFriendName, friendNameError] = useObject(friendNameRef)

    const [mistake, setMistake] = useState(false)
    const [setupError,setSetupError] = useState(false)

    const [loading,setLoading] = useState(true)

    const [ready, setReady] = useState(false)

    useEffect(()=>{
        if(!friendNameSnap||!usernameSnapshot){
            setMistake(true)
            return
        }
        try{
            if(friendNameSnap.exists()&&usernameSnapshot.exists()){
                setFriendName(friendNameSnap.val())
                setUsername(usernameSnapshot.val())
                console.log('success')
                setMistake(false)
            }
            else{
                console.log("there is a mistake")
                setMistake(true)
            }
        }
        catch(err){
            console.log(err.message)
            setMistake(true)
            
        }
        finally{
            setLoading(loadingUsername||
                loadingFriendName||
                loadingUser)
            setSetupError(userError||
                friendNameError||
                usernameError||mistake)
            setReady(!setupError&&!loading)
        }
    },[friendNameSnap,usernameSnapshot,ready,setupError,loading,mistake])

    // useEffect(()=>{
    //     const friendRef = ref(database, `Conversations/${convoID}/${friendID}`)
        
    //     const unsubscribe = onValue(friendRef,(snapshot)=>{
    //         try{
    //             const friendIsOffline = snapshot.val()["userOffline"]
    //             setFriendOffline(friendIsOffline)
    //         }
    //         catch(err){
    //             alert(err.message)
    //         }
    //     })
    //     return ()=>{
    //         unsubscribe()    
    //     }
    // },[])

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
        const friendMessagesRef = ref(database, `Conversations/${convoID}/${friendID}/Messages`)
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
    },[friendNameSnap])
    useEffect(()=>{ /* get user's own messages */
        if(!user)return

        const userMessagesRef = ref(database, `Conversations/${convoID}/${user.uid}/Messages`)
        const unsubscribe = onValue(userMessagesRef,(messageSnapshot)=>{
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
        console.log("123456")
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
        const messagesRef = ref(database, `Conversations/${convoID}/${user.uid}/Messages/${messageID}`)
        const currentDate = new Date()
        const messageObject = {
            dateCreated:currentDate.getTime(),
            content:text,
            sender:user.uid
          }
        /* this is the message document that will be added to the messages
        collection (userMessagesRef). This doesn't have the attribute ID
        because the document itself is an ID */
        try{
            await set(messagesRef,messageObject)  
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
        setUnreadMessages:setUnreadMessages,
        convoID:convoID
        
        /* this information has to be communicated to the MessagesList component
        through a context provider */
    }

    return <div className="chatroomContainer arial ">
        {(loading)&&
            <LoadingScreen></LoadingScreen>
    
        }
        {(setupError)&& 
        /* the variable friendSnapshotError means something is wrong with the path 
        'Users/user.uid/CurrentConversation/friend'*/
            <div>
                <ErrorScreen></ErrorScreen>
            </div>
        }
        
        {(ready)&&
            <div style={{height:"100%",width:"100%"}} className="flexCenter flexColumn">
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

