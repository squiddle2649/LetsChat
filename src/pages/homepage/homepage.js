import {auth, database} from 'firebaseConfig/firebase'
import {ref} from 'firebase/database'
import {useAuthState,useSignOut} from 'react-firebase-hooks/auth'
import {useObject} from 'react-firebase-hooks/database'
import { useNavigate } from 'react-router-dom'
import React, {  useState,useEffect } from 'react';

const HomePage = ()=>{
    const navigate = useNavigate()
    const [user, loadingUser, errorUser] = useAuthState(auth);
    const [signOut,loadingLogout,logoutError] = useSignOut(auth)
    const [snapshot, loadingSnapshot, snapshotError] = useObject(ref(database,`Users/${user.uid}`))
    const [username,setUsername] = useState("")
    

    /* manage user info retrieval */

    if(!user){
        navigate('/')
    }


    /* manage logout */

    if(logoutError){
        alert(logoutError.message)
    }
    

    /* manage getting username from database  */
    if(snapshotError){
        alert(snapshotError.message)
    }    
    useEffect(()=>{
        if(snapshot){
            /* snapshot.val() = {"dateCreated":1713094084929,"username":"yian"} */
            setUsername(snapshot.val().username)
        }
    },[snapshot])

    return <div>
        {(loadingLogout||loadingSnapshot||loadingUser)&&<p>loading…</p>}
        {(errorUser||snapshotError)&&<p>Looks like something went wrong. Try refreshing the page.</p>}
        <div>
            <p>welcome, {username}</p>
            <button onClick={async()=>{
                await signOut();
                navigate('/')
            }}>sign out</button>
        </div>
    </div>
}
export default HomePage