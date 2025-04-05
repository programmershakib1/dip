import { generateCover, generateUsername } from "../../utils/utils";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";
import { useState } from "react";

const SignIn = () => {
  const {
    handleSignIn,
    handleGoogleLogin,
    setUser,
    locationPath,
    setLocationPath,
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const axiosPublic = useAxiosPublic();
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

  const handleSubmit = (e) => {
    setLoading(true);
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    handleSignIn(email, password)
      .then((result) => {
        e.target.reset();
        setUser(result?.user);
        setLoading(false);
        toast.success(`Welcome Back ${result?.user?.displayName}`);
        if (locationPath) {
          navigate(locationPath);
        } else {
          navigate(location?.state ? location.state : "/");
        }
      })
      .catch((error) => {
        setLoading(false);
        toast.error(error?.code);
      });
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
      if (locationPath) {
        navigate(locationPath);
      } else {
        navigate(location?.state ? location.state : "/");
      }
    } catch (error) {
      toast.error(error?.code);
    }
  };

  const handleLocationPath = () => {
    setLocationPath(location.state);
  };

  return (
    <div className="">
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <div className="flex gap-3">
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="border border-black py-1 px-2 rounded-md"
            required
          />
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
        </div>
        <button className="mt-5 w-20 bg-black text-white py-1 px-2 rounded-md">
          {loading ? (
            <span className="loading loading-spinner text-center text-white"></span>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
      <p className="mt-3 text-center text-sm font-semibold">
        Don&apos;t have an Account ?
        <Link to="/signup" onClick={handleLocationPath} className="underline">
          {" "}
          Sign Up
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

export default SignIn;
