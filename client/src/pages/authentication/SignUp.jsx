import useAxiosPublic from "./../../hooks/useAxiosPublic";
import { auth } from "../../firebase/firebase.config";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { updateProfile } from "firebase/auth";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";
import { useState } from "react";
import {
  generateProfile,
  generateCover,
  generateUsername,
} from "../../utils/utils";

const SignUp = () => {
  const { handleSignUp, handleGoogleLogin, setUser } = useAuth();
  const navigate = useNavigate();
  const axiosPublic = useAxiosPublic();
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);
  const toggleConfirmPasswordVisibility = () =>
    setConfirmPasswordVisible(!confirmPasswordVisible);

  // send code
  const sendVerificationCode = async (email) => {
    try {
      setLoading(true);
      const response = await axiosPublic.post("/send-verification-code", {
        email,
      });
      if (response.status === 200) {
        toast.success("Verification code sent to your email.");
        setIsCodeSent(true);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to send verification code."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    try {
      const name = e.target.name.value;
      const email = e.target.email.value;
      const password = e.target.password.value;
      const confirm_password = e.target.confirm_password.value;

      if (password !== confirm_password) {
        setLoading(false);
        return toast.error("Your password is different");
      }

      if (
        password.length < 6 ||
        !/[A-Z]/.test(password) ||
        !/[a-z]/.test(password) ||
        !/[!@#$%^&*(),.?":{}|<>]/.test(password)
      ) {
        setLoading(false);
        return toast.error(
          password.length < 6
            ? "Password must be 6 characters"
            : !/[A-Z]/.test(password)
            ? "At least one uppercase letter"
            : !/[a-z]/.test(password)
            ? "At least one lowercase letter"
            : "At least one special character"
        );
      }

      // send verification code
      if (!isCodeSent) {
        await sendVerificationCode(email);
        return;
      }

      // code verify
      const verifyResponse = await axiosPublic.post("/verify-code", {
        email,
        code: verificationCode,
      });

      if (verifyResponse.status !== 200) {
        setLoading(false);
        return toast.error(
          verifyResponse.data?.error || "Invalid or expired code"
        );
      }

      const profileUrl = await generateProfile(name);
      const coverUrl = await generateCover(name);
      const username = await generateUsername(name);

      const userInfo = {
        name,
        username,
        email,
        role: "user",
        profile: profileUrl,
        cover: coverUrl,
        friends: [],
        following: [],
        followers: [],
        sentRequests: [],
        pendingRequests: [],
        createdAt: new Date().toISOString(),
      };

      const { user } = await axiosPublic.get(`/user/${email}`);

      if (user) {
        toast.error("User already exists");
        setLoading(false);
        return;
      }

      await axiosPublic.post(`/user`, userInfo);

      const result = await handleSignUp(email, password);
      e.target.reset();

      setUser(result?.user);
      updateProfile(auth.currentUser, {
        displayName: name,
        photoURL: profileUrl,
      });
      setUser({ displayName: name, photoURL: profileUrl });
      toast.success(`Welcome ${name}`);
      setVerificationCode("");
      setIsCodeSent(false);
      navigate("/");
    } catch (error) {
      setLoading(false);
      toast.error(error?.code || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const result = await handleGoogleLogin();
      const user = result?.user;

      if (!user) {
        toast.error("Google Sign In Failed");
        return;
      }

      const { data } = await axiosPublic.get(`/user/${user.email}`);

      if (!data) {
        const coverUrl = await generateCover(user.displayName);
        const username = await generateUsername(user.displayName);

        const userInfo = {
          name: user.displayName,
          username: username,
          email: user.email,
          role: "user",
          profile: user.photoURL,
          cover: coverUrl,
          friends: [],
          following: [],
          followers: [],
          sentRequests: [],
          pendingRequests: [],
          createdAt: new Date().toISOString(),
        };

        await axiosPublic.post(`/user`, userInfo);
      }

      setUser(user);
      toast.success(`Welcome ${user?.displayName}`);
      navigate("/");
    } catch (error) {
      toast.error(error?.code);
    }
  };

  return (
    <div className="mt-20">
      <h2 className="text-center text-3xl font-extrabold text-gray-900">
        Welcome
      </h2>
      <div className="flex justify-center items-center mt-10">
        <form onSubmit={handleSubmit} className="w-80 space-y-3">
          <input
            name="name"
            type="text"
            placeholder="Name"
            className="w-full border border-black py-2 px-4 rounded-md"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full border border-black py-2 px-4 rounded-md"
            required
          />
          <div className="relative w-full">
            <input
              name="password"
              type={passwordVisible ? "text" : "password"}
              placeholder="Password"
              className="w-full border border-black py-2 px-4 rounded-md"
              required
            />
            <span
              onClick={togglePasswordVisibility}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
            >
              {passwordVisible ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>
          <div className="relative w-full">
            <input
              name="confirm_password"
              type={confirmPasswordVisible ? "text" : "password"}
              placeholder="Confirm Password"
              className="w-full border border-black py-2 px-4 rounded-md"
              required
            />
            <span
              onClick={toggleConfirmPasswordVisibility}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
            >
              {confirmPasswordVisible ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>
          {isCodeSent && (
            <div className="w-full">
              <input
                type="text"
                placeholder="Enter Verification Code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full border border-black py-2 px-4 rounded-md"
                required
              />
            </div>
          )}
          <button className="w-full bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-md">
            {loading ? (
              <span className="loading loading-spinner text-center text-white"></span>
            ) : isCodeSent ? (
              "Verify"
            ) : (
              "Sign Up"
            )}
          </button>
        </form>
      </div>
      <p className="mt-3 text-center text-sm font-semibold">
        Already have an Account ?
        <Link to="/signin" className="text-blue-700">
          {" "}
          Sign In
        </Link>
      </p>
      <div className="flex justify-center mt-3">
        <button
          onClick={handleGoogleSignUp}
          className="w-80 flex items-center gap-3 hover:bg-zinc-100 font-semibold border border-black py-2 px-4 rounded-md"
        >
          <img
            src="https://auth.openai.com/assets/google-logo-NePEveMl.svg"
            alt=""
          />
          <span>Continue with Google</span>
        </button>
      </div>
    </div>
  );
};

export default SignUp;
