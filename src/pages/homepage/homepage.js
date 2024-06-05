import {auth, database} from 'firebaseConfig/firebase'
import {ref,set,update,onValue,get, onDisconnect,remove} from 'firebase/database'
import {useAuthState,useSignOut} from 'react-firebase-hooks/auth'
import {useObject} from 'react-firebase-hooks/database'
import { useNavigate } from 'react-router-dom'
import React, {  useState,useEffect } from 'react';
import './homePageStyling.css'
import 'components/generalStyling/main.css'
import LoadingScreen from 'components/loadingScreen/loadingScreen'
import { SignOutArrow } from './homePageSVG'
import { Logo } from 'components/logo/logo'
import { Link } from 'react-router-dom'



const HomePage = ()=>{
    const navigate = useNavigate()
    const [user, loadingUser, errorUser] = useAuthState(auth);
    const [snapshot, loadingSnapshot, snapshotError] = useObject(user?ref(database,`Users/${user.uid}`):null)
    // const [snapshotQ, loadingSnapshotQ, snapshotErrorQ] = useObject(user?ref(database,`Queue/${user.uid}`):null)
    
    const [signOut,loadingLogout,logoutError] = useSignOut(auth)
    const [username,setUsername] = useState("")
    const [peopleInQueue, setPeopleInQueue] = useState([])
    const [match,setMatch]=useState(null)
    const [inQueue, setInQueue] = useState(false)
    
    const [nogo, setNogo]=useState(false)

    const queueCollection = ref(database,"Queue")

    const loadingSetup = (loadingLogout||loadingSnapshot||loadingUser)

    /* manage logout */

    if(logoutError){
        alert(`An error occured while loggin out: ${logoutError.message}`)
    }
    
    useEffect(()=>{
        if(snapshot&&user){
            /* snapshot.val() = {"dateCreated":1713094084929,"username":"yian"} */
            // console.log(snapshot.val().username)
            setUsername(snapshot.val().username)
            setNogo(false)
        }
        else{
            setNogo(true)
        }
    },[snapshot])

    const ongoingConvoIDRef = user?ref(database,`Users/${user.uid}/currentConversation`):null
    const [ongoingConvoSnap, loadingOngoingConvo, ongoingConvoError]=useObject(ongoingConvoIDRef)

    const enterQueue = async()=>{
        if(!user||!ongoingConvoSnap)return
        const userInQueueRef = ref(database,`Queue/${user.uid}`)
        try{    
            await set(userInQueueRef,{
                username:"null"                
            })
            /* we actually don't need any value here, so I just set it to null. 
            in the future we will make it so that we just have a list of IDs in 
            the Queue
            */
            setInQueue(true)
            const ongoingConvoID = ongoingConvoSnap.val()
            const convoRef = ref(database,`Conversations/${ongoingConvoID}/${user.uid}`)
            await remove(convoRef)    
            console.log('lets remove the conversation!')
        }
        catch(err){
            alert(`1: An error occured while entering the queue: ${err.message}`)
        }
    }
    const exitQueue = async()=>{
        if(!user)return
        const userInQueueRef = ref(database,`Queue/${user.uid}`)
        try{
            await remove(userInQueueRef)
            setInQueue(false)
        }
        catch(err){
            alert(` 2 An error occured while exiting the queue: ${err.message}`)
        }
    }
    const [snapshotQ, loadingSnapshotQ, snapshotErrorQ] = useObject(queueCollection)
    if(snapshotErrorQ){
        alert(`An error occured: ${snapshotErrorQ.message}`)
    }

    useEffect(()=>{
        if(!inQueue){
            exitQueue()
            return
        } 
            
        const unsubscribe = onValue(queueCollection,(snapshotQ)=>{
            if(!snapshotQ.exists())return
            const queuePeople = snapshotQ.val()
            const queuePeopleIDs = Object.keys(queuePeople)
            queuePeopleIDs.forEach(async(friendID)=>{
                if(friendID!==user.uid){
                    await addToConversation(friendID)
                    return
                }
            })
        })
            
        return()=>{
            unsubscribe()
        }
    },[inQueue])
    
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

    
    // useEffect(()=>{
    //     const removeFromConvo = async()=>{

    //         if(!user||!ongoingConvoSnap)return
    //         if(ongoingConvoSnap.exists()){
    //             const ongoingConvoID = ongoingConvoSnap.val()
    //             const convoRef = ref(database,`Conversations/${ongoingConvoID}/${user.uid}`)
    //             await remove(convoRef)    
    //             console.log('lets remove the conversation!')
    //         }        
    //     }
    //     return()=>{
    //         removeFromConvo()
    //     }
    // },[ongoingConvoSnap])

    const addToConversation = async(friendID)=>{
        const conversationRef = ref(database,`Conversations/${scrambleStrings(friendID,user.uid)}/${user.uid}`)
        const userRef = ref(database,`Users/${user.uid}`)
        try{
            await exitQueue()
            await update(conversationRef,{                
                username:username
            })
            await update(userRef,{
                currentConversation:scrambleStrings(friendID,user.uid)
            })
            navigate(`/chat/${friendID}`)
        }
        catch(err){
            alert(`3: ${err.message}`)
        }
        finally{
            await exitQueue()
        }
    }

    useEffect(()=>{
        if(!user)return
        const userInQueueRef = ref(database,`Queue/${user.uid}`)
        onDisconnect(userInQueueRef).remove()
        
        return ()=>{

            onDisconnect(userInQueueRef).cancel()
        }
    }, []);

    const feedbackRequestStyle = {
        marginBottom:'0'
    }

    const generateRandomKey=(length)=> {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    return <div className='homePageContainer flexCenter '>
        {(loadingSetup)&& <LoadingScreen></LoadingScreen> }
        {(errorUser||snapshotError)&&<p>
            Looks like something went wrong. Try refreshing the page.</p>}
        {(nogo&&!loadingSetup)&& 
            <section className='flexCenter flexColumn arial'>
                <h2 >Looks like you're not signed in</h2>
                <Link to="/">
                    <h3>Return to start page</h3>
                </Link>
            </section>
        }
        {(snapshot&&user)&&
        <div className='flexColumn flexCenter classy'>
            <h1 className='welcomeText arial'><i>Welcome, {username}</i></h1>
    
            {/* 1. If user is in the queue, he will be given an option to exit it.
                2. if he is not in the queue, he will be given an option to enter */}
            {inQueue?
            <div className='flexColumn flexCenter'>
                <p className='arial searchingText'>Finding someone for you…</p>
                <button className ="startChatBtn redBGhover noBorder pointer whiteText " onClick={exitQueue}>
                    <h2 className="arial">Cancel</h2>
                </button>
            </div>
            :
            <div>
                <button className='startChatBtn redBGhover noBorder pointer whiteText' onClick={enterQueue}>
                    <h2 className='arial'>Start chatting</h2>
                </button>
            </div>
            }
            
            <Header 
                exitQueue={exitQueue}
                signOut={signOut}
                navigate={navigate}
            ></Header>
            <div className='disclaimerContainer flexCenter flexColumn'>
                <Link to={"/contact"}>
                    <h2 style={feedbackRequestStyle} className="arial">GIVE ME FEEDBACK</h2>
                </Link>
                <p className='disclaimer arial'>
                    The owner of this site is not responsible for any user generated content (messages, usernames)
                </p>
            </div>

        </div>}

    </div>
}
const Header = (props)=>{

    return <div className='headerContainer'>
        <div className='logoContainer'>
                <Logo></Logo>
            </div>
        <div className='signOutContainer flexCenter'>
            <button className='signOutButton flexCenter' 
                onClick={()=>{
                props.exitQueue()
                props.signOut();
                props.navigate('/')
            }}>
                <SignOutArrow></SignOutArrow>
            </button>
            <h3 className='arial'>Sign out</h3>
        </div>
    </div>
}
export default HomePage