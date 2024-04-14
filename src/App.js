
import StartPage from 'pages/startPage/startPage';
import HomePage from 'pages/homePage/homePage';
import Chatroom from 'pages/chatroom/chatroom';
import { BrowserRouter as Router, Route,Routes } from 'react-router-dom';

import {auth} from 'firebaseConfig/firebase'
function App() {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<StartPage></StartPage>}/>        
      <Route path="/chat" element={<HomePage></HomePage>}/>        
      <Route path="/chat/:friendID" element={<Chatroom></Chatroom>}/>        
      
      </Routes>
    </Router>
  );
}

export default App;
