import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCc4mLj4Ahr03dpp6biamjqC3PlhbQAZCo",
  authDomain: "coffehouse-71463.firebaseapp.com",
  projectId: "coffehouse-71463",
  storageBucket: "coffehouse-71463.firebasestorage.app",
  messagingSenderId: "486533300629",
  appId: "1:486533300629:web:60848a8578d306b61eb69c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const role = document.getElementById("user-role").value;
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const errorElement = document.getElementById("login-error");
  
  // Clear previous errors
  errorElement.textContent = "";
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Redirect based on role
    if (role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "account.html";
    }
    
  } catch (error) {
    console.error("Login error:", error);
    
    // User-friendly error messages
    switch(error.code) {
      case "auth/invalid-email":
        errorElement.textContent = "Please enter a valid email address";
        break;
      case "auth/user-disabled":
        errorElement.textContent = "This account has been disabled";
        break;
      case "auth/user-not-found":
      case "auth/wrong-password":
        errorElement.textContent = "Invalid email or password";
        break;
      default:
        errorElement.textContent = "Login failed. Please try again later";
    }
  }
});