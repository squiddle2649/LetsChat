// import {db, setDoc, doc,collection, ref} from '@firebaseConfig/firebase'
import {set,onValue,ref} from 'firebase/database'
import {database} from '../../firebaseConfig/firebase'
import React, {  useState,useEffect } from 'react';


const Homepage = () =>{
    const [username, setUsername] = useState("")
    const [country, setCountry] = useState("")
    const [users, setUsers] = useState([])
    const usersCollectionRef = ref(database,"Users")
    const addUser = async()=>{
        console.log('add user function')
        const userDocRef = ref(database,`Users/${generateRandomKey(20)}` )
        const date = new Date()
        set(userDocRef,{
            username:username,
            dateCreated:date.getTime()
        })
    }

    useEffect(()=>{
        const unsubscribe = onValue(usersCollectionRef,(snapshot)=>{
            const userData = snapshot.val()
            const usernameList = Object.values(userData).map(
                item => item.username);
            setUsers(usernameList)

            
        })
        return () => unsubscribe();
    },[])

    const generateRandomKey=(length)=> {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
      }
    
    return <div>
        <form onSubmit={(e)=>{
            e.preventDefault()
            addUser()
        }}>
            <input placeholder="Type something cool" type='text' onChange={(e)=>{
                setUsername(e.target.value)
            }}></input>
            
            <button type='submit'>Send</button>
        </form>
        <div>
            <ul>
                {users.map((user)=>(
                    <li key={generateRandomKey(20)}>{user}</li>
                ))}
            </ul>
        </div>
    </div>
}
export default Homepage