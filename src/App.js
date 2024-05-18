import NotFoundPage from 'pages/notFoundPage/notFoundPage';
import StartPage from 'pages/startPage/startPage';
import HomePage from 'pages/homePage/homePage';
import Chatroom from 'pages/chatroom/chatroom';
import { BrowserRouter as Router, Route,Routes } from 'react-router-dom';
// import TestPage from 'pages/testPage/testPage';
import TestPage from 'pages/testPage/testPage';
import ContactPage from 'pages/contactPage/contactPage';

import {auth} from 'firebaseConfig/firebase'
function App() {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<StartPage></StartPage>}/>        
      <Route path="/chat" element={<HomePage></HomePage>}/>        
      <Route path="/chat/:friendID" element={<Chatroom></Chatroom>}/>        
      <Route path='/contact' element={<ContactPage></ContactPage>}></Route>
      <Route path='*' element={<NotFoundPage></NotFoundPage>}></Route>
      <Route path='/test' element={<TestPage></TestPage> }></Route>
      </Routes>
    </Router>
  );
}

export default App;
