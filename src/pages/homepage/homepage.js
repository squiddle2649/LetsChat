import {auth, database} from 'firebaseConfig/firebase'
import {ref,set,get} from 'firebase/database'
import {useAuthState,useSignOut} from 'react-firebase-hooks/auth'
import {useObject,useList,useListKeys,useObjectVal,useListVals} from 'react-firebase-hooks/database'
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

    const queueCollection = ref(database,"Queue")

    /* manage user info retrieval */

    // if(!user){
    //     navigate('/')
    // }

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
            makePair()
        }
        catch(err){
            alert(err.message)
        }
    }

    // const [snapshotQ, loadingSnapshotQ, snapshotErrorQ] = 
    //     useObject(user?ref(database,`Queue/${user.uid}`):null)
    
    useEffect(()=>{
        const unsubscribe=onValue(queueCollection,(snapshot)=>{
            const ids = Object.keys(snapshot.val())
            setPeopleInQueue(ids)
        })
        return ()=>unsubscribe()
    },[inQueue])

    const makePair = async()=>{
        try{
            

        }
        catch(err){
            alert(err.message)
        }
    }

    return <div>
        {(loadingLogout||loadingSnapshot||loadingUser)&&<p>loading…</p>}
        {(errorUser||snapshotError)&&<p>
            Looks like something went wrong. Try refreshing the page.</p>}
        {(snapshot&&user)&&
        <div>
            <p>welcome, {username}</p>
            <button onClick={enterQueue}>start chatting</button>
            <button onClick={async()=>{
                await signOut();
                navigate('/')
            }}>sign out</button>
        </div>}
        <div>
            <ul>
                {peopleInQueue.map((person)=>(
                    <li>{JSON.stringify(person)}</li>
                ))}
            </ul>
        </div>
    </div>
}
export default HomePage