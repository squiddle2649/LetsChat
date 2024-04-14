
import StartPage from 'pages/startPage/startPage';
import HomePage from 'pages/homePage/homePage';
import { BrowserRouter as Router, Route,Routes } from 'react-router-dom';

import {auth} from 'firebaseConfig/firebase'
function App() {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<StartPage></StartPage>}/>        
      <Route path="/chat" element={<HomePage></HomePage>}/>        
      
      </Routes>
    </Router>
  );
}

export default App;
