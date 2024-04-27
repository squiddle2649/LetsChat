import { OptionsSVG,CloseWindowSVG,CheckBoxSVG } from './messageSVG';
import { MessagesContext } from '../messagesList'
import { ChatroomContext } from 'pages/chatroom/chatroom';
import React, {useContext,useState,useRef,createContext } from 'react';
import { OptionsMenu } from './optionsMenu';
import './messageStyling.css'
import { database } from 'firebaseConfig/firebase';
import { ref,set } from 'firebase/database';
import { getByDisplayValue } from '@testing-library/react';

export const MessageContext = createContext()

export const Message = (props)=>{
    const [hoveringMessage,setHoveringMessage] = useState(false)
    const [reportText, setReportText] = useState("")
    const [reportWasFiled,setReportWasFiled] = useState(false)

    const messagesContext = useContext(MessagesContext)
    const selectedMessage = messagesContext
    const reportWindow = useRef(null)
    const messageID = props.messageID
    const showMenu = selectedMessage===messageID

    const chatroomContext = useContext(ChatroomContext)
    const user = chatroomContext.user
    const friendID = chatroomContext.friendID
    const generateRandomKey = chatroomContext.generateRandomKey

    const usernameStyle= {
        color: props.me?"#277ab9":"#cd4e67",
        /* Color of username text will depend on whether 
        it is the user sending the message or the conversation partner */
        margin:"0",
    }   

    const optionButtonVisibility = {
        display:hoveringMessage?"":"none"
    }

    const showReportModal = ()=>{
        reportWindow.current.showModal()
    }
    const closeReportModal = ()=>{
        reportWindow.current.close()
        setReportWasFiled(false)
    }

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
    

    return <div 
                className="arial flexRow flexSpaceBetween" 
                style={{marginTop:"8px",marginBottom:"15px"}}
                onMouseEnter={()=>{setHoveringMessage(true)}}
                onMouseLeave={()=>{
                    if(showMenu)return
                    setHoveringMessage(false)
                }}
                
            >
            
            <div className="flexColumn">
                <p className=" arial-bold" style={usernameStyle}>
                    {props.username}
                </p>
                <h3 className="messageText blackText" style={{marginTop:"0"}}>{props.content}</h3>
            </div>
            <div className="messageOptionContainer" style={optionButtonVisibility}>
                <MessageContext.Provider value={showReportModal}>
                    <OptionsMenu visible={showMenu}></OptionsMenu>
                </MessageContext.Provider>
                <OptionsSVG messageID={messageID}></OptionsSVG>
            </div>
            <dialog ref={reportWindow} className='reportWindow'>
                {reportWasFiled&&
                    <div className='flexCenter flexColumn'>
                        <h2>Your report was submitted</h2>
                        <CheckBoxSVG></CheckBoxSVG>
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
                        <form className='flexColumn' onSubmit={(e)=>{
                            e.preventDefault()
                            fileReport()
                        }}>
                            <label>Please describe the problem</label>
                            <input  className='arial' onChange={(e)=>{
                                setReportText(e.target.value)
                            }}
                            required
                            ></input>
                            <button
                                type='submit'
                                className='submitReport noBorder pointer'
                            >Submit</button>
                        </form>
                    </div>
                }
                <div onClick={closeReportModal}>
                    <CloseWindowSVG></CloseWindowSVG>
                </div>

            </dialog>

            
        </div>
 
}