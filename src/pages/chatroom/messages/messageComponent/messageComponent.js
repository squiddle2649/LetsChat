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
    const [selectedReaction, setReaction] = useState(null)

    const messagesContext = useContext(MessagesContext)
    const selectedMessage = messagesContext
    const reportWindow = useRef(null)
    const messageID = props.messageID
    const me = props.me

    const showMenu = selectedMessage===messageID

    const chatroomContext = useContext(ChatroomContext)
    const user = chatroomContext.user
    const friendID = chatroomContext.friendID
    const generateRandomKey = chatroomContext.generateRandomKey

    const senderID = me?user.uid:friendID
    const messageReactionRef =ref(database,`Users/${senderID}/CurrentConversation/Messages/${messageID}`)

    const usernameStyle= {
        color: me?"#277ab9":"#cd4e67",
        /* Color of username text will depend on whether 
        it is the user sending the message or the conversation partner */
        margin:"0",
    }   

    const showReportModal = ()=>{
        reportWindow.current.showModal()
    }
    const closeReportModal = ()=>{
        reportWindow.current.close()
        setReportWasFiled(false)
    }

    const addAreaction = async(reaction)=>{
        try{
            await update(messageReactionRef,{reaction:reaction})
        }
        catch(err){     
            alert(err.message)
        }
    }

    useEffect(()=>{
        const unsubscribe = onValue(messageReactionRef,(snapshot)=>{
            const messageData = snapshot.val()
            const reaction = messageData['reaction']
            setReaction(reaction)
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
        me:props.me

    }
    
    const selectedReactionStyling = {
        padding: "1px 10px",
        border: "1px solid rgb(166, 59, 223)",
        backgroundColor:"rgba(166, 59, 223, 0.08)",
        borderRadius: "5px",
        display:selectedReaction?"":"none",
        width:"fit-content"
    }

    return <div 
                className="arial flexRow" 
                style={{marginTop:"8px",
                    position:'relative',
                    marginBottom:"15px"}}
                onMouseEnter={()=>{
                    setHoveringMessage(true)
                }}
                onMouseLeave={()=>{
                    if(showMenu)return
                    setHoveringMessage(false)
                }}   
            >
                
                <div className="messageOptionContainer" 
                    style={{/* backgroundColor:'aqua', */
                            display:"flex",
                            alignItems:"center"
                    }}>
                    
                    <div style={{
                            visibility:hoveringMessage?"":"hidden",
                            position:'relative'
                            // backgroundColor:'pink'
                        }}>
                        <MessageContext.Provider value={messageContextVal}>
                            <OptionsMenu visible={showMenu}></OptionsMenu>
                        </MessageContext.Provider>
                        <OptionsSVG messageID={messageID}></OptionsSVG>
                    </div>
                </div>
                <div className="flexColumn">
                    <p className=" arial-bold" style={usernameStyle}>
                        {props.username}
                    </p>
                    <h3 className="messageText blackText" style={{margin:"0"}}>{props.content}</h3>
                    <div 
                        className='flexCenter'
                        style={selectedReactionStyling}>
                        <div>{selectedReaction}</div>
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
                                <p className=" arial-bold" style={usernameStyle}>
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
                                    <input className='arial reportInput' onChange={(e)=>{
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