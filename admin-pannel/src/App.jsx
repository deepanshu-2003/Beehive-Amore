import { Routes, Route } from 'react-router-dom';
import Home from './Components/Home';
import Courses from './Components/Courses';
import Login from './Components/Login';
import CreateCourse from './Components/CreateCourse';
import CourseView from './Components/CourseView';

function App() {
  return (
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/home" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/create-course" element={<CreateCourse />} />
        <Route path="/login" element={<Login />}/>
        <Route path="/course/:id" element={<CourseView />}/>
        
      </Routes>
  );
}

export default App;
