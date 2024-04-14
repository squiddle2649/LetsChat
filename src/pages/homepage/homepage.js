import {auth, database} from 'firebaseConfig/firebase'
import {ref} from 'firebase/database'
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
            // setUsername(snapshot.val().username)
        }
    },[snapshot])

    return <div>
        {(loadingLogout||loadingSnapshot||loadingUser)&&<p>loading…</p>}
        {(errorUser||snapshotError)&&<p>
            Looks like something went wrong. Try refreshing the page.</p>}
        {(snapshot&&user)&&
        <div>
            <p>welcome, {JSON.stringify(snapshot.val())}</p>
            <p>welcome, {JSON.stringify(user.uid)}</p>
            {/* <p>welcome, {JSON.stringify(snapshot.val().username)}</p> */}
            <button onClick={async()=>{
                await signOut();
                navigate('/')
            }}>sign out</button>
        </div>}
    </div>
}
export default HomePage