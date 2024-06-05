import './testDBStyling.css'
import React, {useState,useEffect,useContext } from 'react';
import { useAuthState } from "react-firebase-hooks/auth"
import { ref,get,update} from 'firebase/database';
import { database,auth } from 'firebaseConfig/firebase';

const TestDB  = () => {
    const [username,setUsername] = useState("")
    const userID = "9X8oqSDo3Je1iZhmuxYa2Cwnz3H3"
    const friendID = "NAaA4WMAOxbkeTrnhLhObGgomiH3"
    const [user,loadingUser,userError] = useAuthState(auth)
    const [firstString,setFirstString]= useState(userID)
    const [secondString,setSecondString]= useState(friendID)
    const [resultedString, setResultedString] = useState(null)
    const [alternateString, setAlternateString] = useState(null)

    function scrambleStrings(str1, str2) {
        
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

    return <div>
        <form onSubmit={(e)=>{
            e.preventDefault()
            const scrambledVersion = scrambleStrings(firstString,secondString)
            const alternateVersion = scrambleStrings(secondString,firstString)
            setResultedString(scrambledVersion)
            setAlternateString(alternateVersion)
        }}>
            <input placeholder='first ID'
                onChange={(e)=>{
                    setFirstString(e.target.value)
                }}
            ></input>
            <input placeholder='second ID'
                onChange={(e)=>{
                    setSecondString(e.target.value)
                }}
            ></input>
            <button type='submit'>SCRAMBLE</button>
        </form>
        <h3>Scrambled string: {resultedString}</h3>
        <h3>Alternate string: {alternateString}</h3>
        <h3>Equal? {JSON.stringify(alternateString===resultedString)}</h3>
    </div>

};

export default TestDB