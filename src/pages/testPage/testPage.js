import React, { useEffect,useState } from 'react';
import { database,auth } from "firebaseConfig/firebase"

import { ref, set,onDisconnect,onValue,get, remove,update } from "firebase/database"


const  TestPage = () => {
    const userId = "hKSqdsAIhTOPasn37sULE9bBDjZ2"
    const [isOnline, setIsOnline] = useState(false);

    useEffect(() => {
        
        const userStatusDatabaseRef = ref(database,`/status/${userId}`);
        
        const isOfflineForDatabase = {
            state: 'offline',
            // last_changed:.ServerValue.TIMESTAMP,
        };

        const isOnlineForDatabase = {
            state: 'online',
            // last_changed: firebase.database.ServerValue.TIMESTAMP,
        };

        const connectedRef = ref(database,'.info/connected')
        connectedRef.on('value', (snapshot) => {
            if (snapshot.val() === false) {
                return;
            }

            userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase).then(() => {
                userStatusDatabaseRef.set(isOnlineForDatabase);
            });
        });

        userStatusDatabaseRef.on('value', (snapshot) => {
            const status = snapshot.val();
            setIsOnline(status ? status.state === 'online' : false);
        });

        return () => {
            userStatusDatabaseRef.off();
            connectedRef.off();
        };
    }, [userId]);

    return (
        <div>
            <p>user hKSqdsAIhTOPasn37sULE9bBDjZ2 is {isOnline}</p>
        </div>
    );
};



export default TestPage