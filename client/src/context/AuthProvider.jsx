import { auth } from "../firebase/firebase.config";
import { useEffect, useState } from "react";
import AuthContext from "./AuthContext";
import PropTypes from "prop-types";
import axios from "axios";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const googleProvider = new GoogleAuthProvider();

  const handleSignUp = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const handleSignIn = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    return signInWithPopup(auth, googleProvider);
  };

  const handleSingOut = () => {
    setLoading(true);
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser?.email) {
        const user = { email: currentUser.email };

        axios
          .post(`${import.meta.env.VITE_SERVER_URL}/jwt`, user, {
            withCredentials: true,
          })
          .then(() => {
            setUser(currentUser);
            setLoading(false);
          });
      } else {
        setUser(currentUser);
        axios
          .post(
            `${import.meta.env.VITE_SERVER_URL}/signOut`,
            {},
            { withCredentials: true }
          )
          .then(() => {
            setLoading(false);
          });
      }
    });
    return () => {
      unsubscribe;
    };
  }, []);

  const authInfo = {
    handleSignUp,
    handleSignIn,
    handleGoogleLogin,
    handleSingOut,
    user,
    setUser,
    loading,
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.element,
};

export default AuthProvider;
