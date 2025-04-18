import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './Components/Home';
import Courses from './Components/Courses';
import Login from './Components/Login';
import CreateCourse from './Components/CreateCourse';
import CourseView from './Components/CourseView';
import { useAuth } from './Context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>; // Show loading indicator
  }

  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
      <Routes>
        <Route path="/login" element={<Login />}/>
        
        <Route path="/" element={
          <ProtectedRoute>
            <Home/>
          </ProtectedRoute>
        } />
        
        <Route path="/home" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        
        <Route path="/courses" element={
          <ProtectedRoute>
            <Courses />
          </ProtectedRoute>
        } />
        
        <Route path="/create-course" element={
          <ProtectedRoute>
            <CreateCourse />
          </ProtectedRoute>
        } />
        
        <Route path="/course/:id" element={
          <ProtectedRoute>
            <CourseView />
          </ProtectedRoute>
        } />
      </Routes>
  );
}

export default App;
