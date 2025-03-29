import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Components/Home';
import About from './Components/About';
import Services from './Components/Services';
import Courses from './Components/Courses';
import Contact from './Components/Contact';
import Login from './Components/Login';
import CreateCourse from './Components/CreateCourse';
import Account from './Components/Account';
import CourseView from './Components/CourseView';
import Placements from './Components/Placements';
import PlacementView from './Components/PlacementView';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/account" element={<Account />} />
        <Route path="/create-course" element={<CreateCourse />} />
        <Route path="/login" element={<Login />}/>
        <Route path="/course/:id" element={<CourseView />}/>
        <Route path="/placements" element={<Placements />}/>
        <Route path="/placement/:id" element={<PlacementView />}/>
        
      </Routes>
    </Router>
  );
}

export default App;