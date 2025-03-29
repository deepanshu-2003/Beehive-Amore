import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../contexts/AuthContext";
import { showToast, persistentToast } from "../utils/toastUtils";

const GoogleAuthenticator = ({ navigate }) => {
  const { login } = useAuth();

  return (
    <div className="google-login">
      {/* Google Authentication */}
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          try {
            console.log("Google login successful, processing...");
            
            // Check if we have a valid credential response
            if (!credentialResponse || !credentialResponse.credential) {
              console.error("Invalid credential response:", credentialResponse);
              showToast.error("Google Sign-Up Failed: Invalid credentials");
              return;
            }
            
            const response = await fetch(
              `${import.meta.env.VITE_BACKEND_URL}/auth/google-login`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  token: credentialResponse.credential, // Send the token to the backend
                }),
              }
            );

            // First check if the response exists
            if (!response) {
              console.error("No response received from server");
              showToast.error("Google Sign-Up Failed: No response from server");
              return;
            }

            const data = await response.json();
            console.log("Server response data:", data); // Log the actual response

            if (!response.ok) {
              const errorMessage = data?.error || "Google Sign-Up Failed";
              console.error("Server error response:", errorMessage);
              showToast.error(errorMessage);
              return;
            }

            // Verify we have the auth token before proceeding
            if (!data || !data.auth_token) {
              console.error("Missing auth_token in response:", data);
              showToast.error("Google Sign-Up Failed: Authentication error");
              return;
            }

            // Show success toast first with persistence
            persistentToast.show(
              'google-login-success',
              "Google Sign-Up Successful! Welcome to Anvi Digital Hub.",
              'success',
              { autoClose: 5000 } // Make sure it stays visible
            );
            
            // Update the authentication state
            await login(data.auth_token);
            
            // Navigate immediately to home page
            navigate("/");
          } catch (err) {
            console.error("Error during Google Sign-Up:", err);
            showToast.error("Google Sign-Up Failed: " + (err.message || "Please try again"));
          }
        }}
        onError={(error) => {
          console.error("Google login error:", error);
          showToast.error("Google Sign-Up Failed. Please try again.");
        }}
      />
    </div>
  );
};

export default GoogleAuthenticator;
