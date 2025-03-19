import { generateDefaultImage, generateUsername } from "../../utils/utils";
import useAxiosPublic from "./../../hooks/useAxiosPublic";
import { auth } from "../../firebase/firebase.config";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { updateProfile } from "firebase/auth";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";
import { useState } from "react";

const SignUp = () => {
  const {
    handleSignUp,
    handleGoogleLogin,
    setUser,
    locationPath,
    setLocationPath,
  } = useAuth();
  const [loading, setLoading] = useState(false);
  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);
  const toggleConfirmPasswordVisibility = () =>
    setConfirmPasswordVisible(!confirmPasswordVisible);

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

      const imageUrl = await generateDefaultImage(name);
      const username = await generateUsername(name);

      const userInfo = {
        name,
        username,
        email,
        image: imageUrl,
        friends: [],
        following: [],
        followers: [],
        sentRequests: [],
        pendingRequests: [],
        created_at: new Date().toISOString(),
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
        photoURL: imageUrl,
      });
      setUser({ displayName: name, photoURL: imageUrl });
      toast.success(`Welcome ${name}`);
      navigate(locationPath ? locationPath : "/");
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
        const username = await generateUsername(user.displayName);

        const userInfo = {
          name: user.displayName,
          username: username,
          email: user.email,
          image: user.photoURL,
          friends: [],
          following: [],
          followers: [],
          sentRequests: [],
          pendingRequests: [],
          created_at: new Date().toISOString(),
        };

        await axiosPublic.post(`/user`, userInfo);
      }

      setUser(user);
      toast.success(`Welcome ${user?.displayName}`);
      navigate(locationPath ? locationPath : "/");
    } catch (error) {
      toast.error(error?.code);
    }
  };

  const handleLocationPath = () => {
    setLocationPath(locationPath);
  };

  return (
    <div className="">
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <div className="flex gap-3">
          <input
            name="name"
            type="text"
            placeholder="Name"
            className="border border-black py-1 px-2 rounded-md"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="border border-black py-1 px-2 rounded-md"
            required
          />
        </div>
        <div className="flex gap-3 mt-3">
          <div className="relative">
            <input
              name="password"
              type={passwordVisible ? "text" : "password"}
              placeholder="Password"
              className="border border-black py-1 px-2 rounded-md"
              required
            />
            <span
              onClick={togglePasswordVisibility}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
            >
              {passwordVisible ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>
          <div className="relative">
            <input
              name="confirm_password"
              type={confirmPasswordVisible ? "text" : "password"}
              placeholder="Confirm Password"
              className="border border-black py-1 px-2 rounded-md"
              required
            />
            <span
              onClick={toggleConfirmPasswordVisibility}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
            >
              {confirmPasswordVisible ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>
        </div>
        <button className="mt-5 w-20 bg-black text-white py-1 px-2 rounded-md">
          {loading ? (
            <span className="loading loading-spinner text-center text-white"></span>
          ) : (
            "Sign Up"
          )}
        </button>
      </form>
      <p className="mt-3 text-center text-sm font-semibold">
        Already have an Account ?
        <Link to="/signin" onClick={handleLocationPath} className="underline">
          {" "}
          Sign In
        </Link>
      </p>
      <div className="flex justify-center mt-3">
        <button
          onClick={handleGoogleSignUp}
          className="bg-black text-white py-1 px-3 rounded-md"
        >
          <i className="fa-brands fa-google text-white pr-2"></i>
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default SignUp;
