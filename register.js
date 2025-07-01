import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
const db = getFirestore(app);

document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  const errorElement = document.getElementById("register-error");
  
  if (password !== confirmPassword) {
    errorElement.textContent = "Passwords do not match";
    return;
  }
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update user profile
    await updateProfile(user, { displayName: name });
    
    // Create user document in Firestore
    await setDoc(doc(db, "customers", user.uid), {
      name,
      email,
      phone,
      createdAt: new Date().toISOString()
    });
    
    window.location.href = "index.html";
  } catch (error) {
    errorElement.textContent = "Registration failed: " + error.message;
  }
});