// import {database, setDoc, doc,collection, ref} from '@firebaseConfig/firebase'
import {set,onValue,ref} from 'firebase/database'
import {database} from 'firebaseConfig/firebase'
import React, {  useState,useEffect } from 'react';


const Homepage = () =>{
    const [username,setUsername]=useState("")
    const [users, setUsers] = useState([])
    const usersCollectionRef = ref(database,"Users")
    const addUser = async()=>{
        const userDocumentRef = ref(database,`Users/${generateRandomKey(20)}`)
        const currentDate = new Date()
        try{
            await set(userDocumentRef,{
                username:username,
                dateCreated:currentDate.getTime()
            })
        }
        catch(err){ 
            alert(err.message)
        }

    }
    
    useEffect(()=>{
        
        const unsubscribe=onValue(usersCollectionRef,(snapshot)=>{
                const usersData = snapshot.val() 
                /* This has the format: {id1:{username:x,date:y},
                id2:{username:x2,date:y2}} */
                
                const userValues = Object.values(usersData)
                /* getting a list of all the values in the usersData
                dictionary so that I can get the following list:
                [{username:x,date:y},{username:x1,date:y1},{username:x2,date:y2}] */
                
                const sortedUserValues = sortArray(userValues) /* sort in descending dateCreated order
                so that the newest users are at the start */
                console.log(sortedUserValues)
                setUsers(sortedUserValues)
                
            })
            
        
        return ()=>unsubscribe()
    },[])


    const generateRandomKey=(length)=> {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
    const sortArray = (arr)=>{
            /* sorts an array such as
        [{dateCreated: 1713, username: 'mike'},
        {dateCreated: 172, username: 'tyson'},
        {dateCreated: 100, username: 'Bruno'}] in ascending order*/
        arr.sort((a,b)=>
            b.dateCreated-a.dateCreated
        )
        return arr
    }

    return <div>
        <form onSubmit={(e)=>{
            e.preventDefault()
            addUser()
        }}>
            <label>Hi, my name is </label>
            <input required type="text"  onChange={(e)=>{
                setUsername(e.target.value)
            }}></input>    
            <button type='submit'>Enter</button>
        </form>        
        <div>
            <ul>
                {users.map((user)=>(
                    <li key={generateRandomKey(20)}>{user.username}; date created: {user.dateCreated}</li>
                ))}
                
            </ul>
        </div>
        
    </div>
}
export default Homepage