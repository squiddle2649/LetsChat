import './testDBStyling.css'
import React, {useState,useEffect,useContext } from 'react';
import { useAuthState } from "react-firebase-hooks/auth"
import { useObject } from 'react-firebase-hooks/database';
import { ref,get,update} from 'firebase/database';
import { database,auth } from 'firebaseConfig/firebase';

const TestDB  = () => {

    const [data, setData] = useState(false)
    const dataRef = ref(database,"Users")
    const [dataSnap,dataLoading,dataError] = useObject(dataRef)

    const collectData = ()=>{
        if(!dataSnap)return
        const values = Object.keys(dataSnap.val())
        console.log('collecting data from DB')
        setData(values)
    }
    
    useEffect(()=>{
        collectData()
    },[dataSnap])

    return <div>
        {dataLoading && <h2 style={{color:"green"}}>loading…</h2>}
        {dataError && <h2 style={{color:"red"}}>There is an error</h2>}
        {dataSnap && <h2>{JSON.stringify(data)}</h2>}
        <button onClick={collectData}>set data</button>
    </div>

};

export default TestDB