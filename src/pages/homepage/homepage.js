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
    
    const [signOut,loadingLogout,logoutError] = useSignOut(auth)
    const [username,setUsername] = useState("")
    const [peopleInQueue, setPeopleInQueue] = useState([])
    const [inQueue, setInQueue] = useState(false)
    const [match,setMatch]=useState(null)
    const [isUserOnline, setIsUserOnline] = useState(null);

    const queueCollection = ref(database,"Queue")

    /* manage logout */

    if(logoutError){
        alert(logoutError.message)
    }
    
    useEffect(()=>{
        if(snapshot&&user){
            /* snapshot.val() = {"dateCreated":1713094084929,"username":"yian"} */
            // console.log(snapshot.val().username)
            setUsername(snapshot.val().username)
        }
    },[snapshot])

    const enterQueue = async()=>{
        const userInQueueRef = ref(database,`Queue/${user.uid}`)
        try{    
            await set(userInQueueRef,{
                username:username
            })
            setInQueue(true)
            
        }
        catch(err){
            alert(err.message)
        }
    }
    const exitQueue = async()=>{
        const userInQueueRef = ref(database,`Queue/${user.uid}`)
        try{
            await remove(userInQueueRef)
            setInQueue(false)
        }
        catch(err){
            alert(err.message)
        }

    }

    /* useEffect(async()=>{
        if(!user)return
        const presenceRef = ref(database, '.info/connected');
        const userStatusRef = ref(database, `Status/${user.uid}`);
        const unsubscribe = onValue(presenceRef, (snapshot) => {
            if (snapshot.exists() && snapshot.val() === true) {
              // User is online
              setIsUserOnline(true);
              
              // Set user's presence to online when connected
               set(userStatusRef,{ online: true });
              
              // Set user's presence to offline when disconnected
            
            onDisconnect(userStatusRef).set({online:false})
              
            } else {
              // User is offline
              setIsUserOnline(false);
            }
          });

          // Clean up on unmount
    return () => {
        // Reset user's presence to offline
        onDisconnect(userStatusRef).set({online:false})
      };
    }, []); */
    
    // useEffect(()=>{
    //     if(!user||!inQueue)return
    //     const unsubscribe=onValue(queueCollection,(snapshot)=>{
    //         const ids = Object.keys(snapshot.val())
    //         setPeopleInQueue(ids)

    //         /* we are now going to filter this ids array so that it doesn't include the
    //         user's own id */
            
    //         const filteredIDs = ids.filter(item => item!==user.uid)
    //         console.log(filteredIDs)
    //         console.log(`in queue = ${inQueue}`)
    //         if(filteredIDs[0]){
    //             setMatch(filteredIDs[0])
    //             navigate(`/chat/${filteredIDs[0]}`)
    //         }


    //     })
    //     return ()=>unsubscribe()
    // },[inQueue])


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
                await signOut();
                navigate('/')
            }}>sign out</button>
        </div>}
        
        
        
    </div>
}
export default HomePage