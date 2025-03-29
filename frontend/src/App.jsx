import "./App.css";
import "./bootstrap-overrides.css";
import { Route, Routes, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth, AuthChecker } from "./contexts/AuthContext";
import { setupAxiosInterceptors } from "./utils/axiosConfig";
import { useEffect } from "react";
import Home from "./Components/Home";
import About from "./Components/About";
import Courses from "./Components/Courses";
import Contact from "./Components/Contact";
import Services from "./Components/Services";
import Login from "./Components/Login";
import Register from "./Components/Register";
import Account from "./Components/Account";
import CourseView from "./Components/CourseView";
import Verification from "./Components/Verification";
import Dashboard from "./Components/Dashboard";
import ServiceDetail from "./Components/ServiceDetail";
import Placements from "./Components/Placements";
import PlacementView from "./Components/PlacementView";
import Header from "./Components/Header";
import Loading from './Components/Loading';

// Main App wrapper with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

// AppContent component that uses the auth context
function AppContent() {
  const { isLoggedIn, isEmailVerified, user, handleLogout, loading } = useAuth();
  const navigate = useNavigate();
  
  // Set up axios interceptors to handle token expiration
  useEffect(() => {
    setupAxiosInterceptors(handleLogout, navigate);
  }, [handleLogout, navigate]);

  // Wrapper component to conditionally render Header
  const PageWithHeader = ({ component: Component, showHeader = true, ...rest }) => {
    console.log("Rendering PageWithHeader, isLoggedIn:", isLoggedIn, "user:", user);
    return (
      <>
        {showHeader && (
          <Header 
            isLoggedIn={isLoggedIn} 
            user={user} 
            isEmailVerified={isEmailVerified}
            handleLogout={() => handleLogout(true, navigate)}
          />
        )}
        <Component {...rest} />
      </>
    );
  };

  // If still loading auth state, you could show a spinner here
  if (loading) {
    return <Loading />;
  }

  return (
    <>
      {/* ToastContainer moved to main.jsx */}
      <AuthChecker>
        <Routes>
          <Route path="/" element={<PageWithHeader component={Home} />} />
          <Route path="/home" element={<PageWithHeader component={Home} />} />
          <Route path="/about" element={<PageWithHeader component={About} />} />
          <Route path="/courses" element={<PageWithHeader component={Courses} />} />
          <Route path="/services" element={<PageWithHeader component={Services} />} />
          <Route path="/contact" element={<PageWithHeader component={Contact} />} />
          <Route path="/account" element={<PageWithHeader component={Account} />} />
          <Route path="/login" element={<PageWithHeader component={Login} />} />
          <Route path="/register" element={<PageWithHeader component={Register} />} />
          <Route path="/course/:id" element={<PageWithHeader component={CourseView} />} />
          <Route path="/verify" element={<PageWithHeader component={Verification} />} />
          <Route path="/dashboard" element={<PageWithHeader component={Dashboard} />} />
          <Route path="/services/:title" element={<PageWithHeader component={ServiceDetail} />} />
          <Route path="/placements" element={<PageWithHeader component={Placements} />} />
          <Route path="/placement/:id" element={<PageWithHeader component={PlacementView} />} />
        </Routes>
      </AuthChecker>
    </>
  );
}

export default App;
