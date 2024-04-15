import {auth, database} from 'firebaseConfig/firebase'
import {ref,set,onValue, onDisconnect,remove} from 'firebase/database'
import {useAuthState,useSignOut} from 'react-firebase-hooks/auth'
import {useObject} from 'react-firebase-hooks/database'
import { useNavigate } from 'react-router-dom'
import React, {  useState,useEffect } from 'react';

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
    

    const queueCollection = ref(database,"Queue")

    /* manage logout */

    if(logoutError){
        alert(`An error occured while loggin out: ${logoutError.message}`)
    }
    
    useEffect(()=>{
        if(snapshot&&user){
            /* snapshot.val() = {"dateCreated":1713094084929,"username":"yian"} */
            // console.log(snapshot.val().username)
            setUsername(snapshot.val().username)
        }
    },[snapshot])

    const enterQueue = async()=>{
        if(!user)return
        const userInQueueRef = ref(database,`Queue/${user.uid}`)
        try{    
            await set(userInQueueRef,{
                username:username
            })
            setInQueue(true)
            
            
        }
        catch(err){
            alert(`An error occured while entering the queue: ${err.message}`)
        }
    }
    const exitQueue = async()=>{
        const userInQueueRef = ref(database,`Queue/${user.uid}`)
        try{
            await remove(userInQueueRef)
            setInQueue(false)
        }
        catch(err){
            alert(`An error occured while exiting the queue: ${err.message}`)

        }
    }
    const [snapshotQ, loadingSnapshotQ, snapshotErrorQ] = useObject(queueCollection)
    if(snapshotErrorQ){
        alert(`An error occured: ${snapshotErrorQ.message}`)
    }

    const addToConversation = async(friendID)=>{
        const conversationRef = ref(database,`Users/${user.uid}/CurrentConversation`)
        try{
            await set(conversationRef,{
                friend:friendID
            })
        }
        catch(err){
            alert(err.message)
        }
    }

    useEffect(()=>{
        if(!inQueue){
            exitQueue()
            return
        } 
            
        const unsubscribe = onValue(queueCollection,(snapshotQ)=>{
        snapshotQ.forEach(async(document)=>{
            const documentID = document.key;
            if(documentID!==user.uid){
                exitQueue()
                addToConversation(documentID)
                navigate(`/chat/${documentID}`)
            }
        })
        })
            
        return()=>{
            unsubscribe()
        }
    },[inQueue])
    

    useEffect(()=>{
        if(!user)return
        const userInQueueRef = ref(database,`Queue/${user.uid}`)
        onDisconnect(userInQueueRef).remove()

        return ()=>{
            console.log('cleaning up')
        }
    }, []);


    return <div>
        {(loadingLogout||loadingSnapshot||loadingUser)&&<p>loading…</p>}
        {(errorUser||snapshotError)&&<p>
            Looks like something went wrong. Try refreshing the page.</p>}
        {(snapshot&&user)&&
        <div>
            <p>welcome, {username}</p>

            {/* 1. If user is in the queue, he will be given an option to exit it.
                2. if he is not in the queue, he will be given an option to enter */}
            {inQueue?<button onClick={exitQueue}>exit queue</button>
            :<button onClick={enterQueue}>start chatting</button>}
            
            <button onClick={async()=>{
                await exitQueue()
                await signOut();
                navigate('/')
            }}>sign out</button>
        </div>}

        {(inQueue)&&<p>finding someone…</p>}
        
        <button onClick={()=>{ addToConversation("random user")}}>add to convos</button>
    </div>
}
export default HomePage