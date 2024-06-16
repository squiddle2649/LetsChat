import { OptionsSVG,CloseWindowSVG,CheckBoxSVG } from './messageSVG';
import { MessagesContext } from '../messagesList'
import { ChatroomContext } from 'pages/chatroom/chatroom';
import React, {useContext,useState,useRef,createContext,useEffect } from 'react';
import { OptionsMenu } from './optionsMenu';
import './messageStyling.css'
import { database } from 'firebaseConfig/firebase';
import { ref,set,update,onValue } from 'firebase/database';
import { getByDisplayValue } from '@testing-library/react';
import { Link } from 'react-router-dom';

export const MessageContext = createContext()

export const Message = (props)=>{
    const [hoveringMessage,setHoveringMessage] = useState(false)
    const [reportText, setReportText] = useState("")
    const [reportWasFiled,setReportWasFiled] = useState(false)
    const [userReaction, setUserReaction] = useState(null)
    const [friendReaction, setFriendReaction] = useState(null)

    const messagesContext = useContext(MessagesContext)
    const selectedMessage = messagesContext
    const reportWindow = useRef(null)
    const messageElement = useRef(null)
    const messageID = props.messageID
    const me = props.me

    const showMenu = selectedMessage===messageID

    const chatroomContext = useContext(ChatroomContext)
    const user = chatroomContext.user
    const friendID = chatroomContext.friendID
    const generateRandomKey = chatroomContext.generateRandomKey
    const chatroomRef = chatroomContext.chatroomRef
    const scrolledToBottom = chatroomContext.scrolledToBottom
    const convoID = chatroomContext.convoID
    const setUnreadMessages = chatroomContext.setUnreadMessages
    const unreadSet = new Set();

    const senderID = me?user.uid:friendID
    const messageReactionRef =ref(database,`Conversations/${convoID}/Messages/${messageID}`)

    const usernameStyle= {
        color: me?"#277ab9":"#cd4e67",
        marginBottom:'0',
        marginTop:props.replying?"0":"15px",
        marginLeft:"35px"
    }   

    const showReportModal = ()=>{
        reportWindow.current.showModal()
    }
    const closeReportModal = ()=>{
        reportWindow.current.close()
        setReportWasFiled(false)
    }

    useEffect(()=>{        
        if(senderID===friendID&&!scrolledToBottom){
            /* first condition means that the message has come
            from the friend. If user is not scrolled to bottom, 
            that means he has not read the message, therefore
            we push this messsage to the unreadMessages array */
            if(unreadSet.has(messageID))return
            setUnreadMessages(prevMessages => [...prevMessages,messageID])
            unreadSet.add(messageID)
            return
        }
        /* otherwise, the chatroom is scrolled to the bottom at the 
        arrival of a new message. */
        chatroomRef.current.scrollTop = chatroomRef.current.scrollHeight
        
    },[])

    useEffect(() => {      
        /* if user scrolls to the bottom of chatroom, there are
        no more unread messages. Logical, right? */
        if(!scrolledToBottom)return
        setUnreadMessages([])
    }, [scrolledToBottom])
    
    const addAreaction = async(reaction)=>{
        try{
            if(me){
                await update(messageReactionRef,{userReaction:reaction})
            }
            else{
                await update(messageReactionRef,{friendReaction:reaction})

            }
        }
        catch(err){     
            alert(err.message)
        }
    }

    useEffect(()=>{
        const unsubscribe = onValue(messageReactionRef,(snapshot)=>{
            
            const messageData = snapshot.val()
            if(!snapshot.exists())return
            if(me){
                const friendEmoji = messageData['friendReaction']
                setFriendReaction(friendEmoji)
                const userEmoji = messageData['userReaction']
                setUserReaction(userEmoji)
            }
            else{
                const friendEmoji = messageData['userReaction']
                setFriendReaction(friendEmoji)
                const userEmoji = messageData['friendReaction']
                setUserReaction(userEmoji)
            }

            
        })
        return ()=>{
            unsubscribe()
        }
    },[])

    const fileReport = async()=>{
        const reportID = generateRandomKey(20)
        const reportRef = ref(database,`Reports/${reportID}`)
        const currentDate = new Date()
        const reportObject = {
            from:user.uid,
            against:friendID,
            date:currentDate.getTime(),
            badMessage:props.content,
            reportComment:reportText
        }
        try{
            await set(reportRef,reportObject)
            setReportWasFiled(true)
        }
        catch(err){
            alert(`Something went wrong while filing the report: ${err.message}`)
        }
    }

    const messageContextVal = {
        showModal:showReportModal,
        addAReaction:addAreaction,
        me:props.me,
        messageID:messageID,
        content:props.content
    }
    
    const userReactionStyling = {
        padding: "1px 10px",
        border: "1px solid #277ab9",
        backgroundColor:"rgb(39, 122,185,0.41)",
        borderRadius: "5px",
        display:userReaction?"":"none",
        width:"fit-content",
        marginBottom:"8px"
    }
    const friendReactionStyling = {
        padding: "1px 10px",
        border: "1px solid #cd4e67",
        backgroundColor:"rgb(205, 78, 103,0.41)",
        borderRadius: "5px",
        display:friendReaction?"":"none",
        width:"fit-content",
        marginBottom:"8px"
    }

    return <div ref={messageElement}
                className="flexRow messageContainer" 
                onMouseEnter={()=>{
                    setHoveringMessage(true)
                }}
                onMouseLeave={()=>{
                    if(showMenu)return
                    setHoveringMessage(false)
                }}   
            >

                <div className="flexColumn" style={{width:"100%"}}>
                    {props.replying&&<div className='line'>
                        <div className='replyInfo'>
                            <div style={{
                                    color: props.replying.senderName===props.username?"#277ab9":"#cd4e67",
                                    marginRight:"10px"
                                }}>
                                <strong>{props.replying.senderName}</strong>
                            </div>
                            <div>
                                {props.replying.content}
                            </div>
                        </div>
                    </div>}
                    {!props.continuousSender&& 
                        <h3 className=" " style={usernameStyle}>
                            {props.username}
                        </h3>}
                    <h3 className="messageText blackText" 
                        style={{
                            backgroundColor:hoveringMessage?"rgb(244, 244, 244)":"",}}>
                        <div style={{
                                visibility:hoveringMessage?"":"hidden",
                                display:"flex",
                                alignItems:"center",
                                position:'relative'}}>
                            <MessageContext.Provider value={messageContextVal}>
                                <OptionsMenu visible={showMenu}></OptionsMenu>
                            </MessageContext.Provider>
                            <OptionsSVG messageID={messageID}></OptionsSVG>
                        </div>
                        {props.content}
                        {/* <button onClick={()=>{
                            console.log(isChildOverflowing())
                        }}>overflowing?</button> */}
                    </h3>
                    <div className="flexCenter reactionsContainer">
                        <div
                            className='flexCenter'
                            style={userReactionStyling}>
                            <div>{userReaction}</div>
                        </div>
                        <div
                            className='flexCenter'
                            style={friendReactionStyling}>
                            <div>{friendReaction}</div>
                        </div>
                    </div>

                </div>
                <dialog ref={reportWindow} className='reportWindow'>
                    {reportWasFiled&&
                        <div className='flexCenter flexColumn'>
                            <h2>Your report was submitted</h2>
                            <CheckBoxSVG></CheckBoxSVG>
                            <h3>Would you like to return <Link to="/chat">home?</Link></h3>
                        </div>
                    }
                    {!reportWasFiled&&
                        <div>
                            <h1>Report Message</h1>
                            <div className='badMessageDisplay flexColumn'>
                                <p style={usernameStyle}>
                                    {props.username}
                                </p>
                                <h3 className="messageText blackText" style={{margin:"0"}}>{props.content}</h3>
                            </div>
                            <div>
                                <form className='flexColumn' onSubmit={(e)=>{
                                    e.preventDefault()
                                    fileReport()
                                }}>
                                    <label>Please describe the problem</label>
                                    <input className='reportInput' onChange={(e)=>{
                                        setReportText(e.target.value)
                                    }}
                                    // required
                                    ></input>
                                    <button
                                        type='submit'
                                        className='submitReport noBorder pointer whiteText'
                                    >Submit</button>
                                </form>
                            </div>
                        </div>
                    }
                    <div onClick={closeReportModal}>
                        <CloseWindowSVG></CloseWindowSVG>
                    </div>

                </dialog>            
        </div>
 
}