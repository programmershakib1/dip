import { generateCover, generateUsername } from "../../utils/utils";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";
import { useState } from "react";

const SignIn = () => {
  const { handleSignIn, handleGoogleLogin, setUser } = useAuth();
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
        navigate("/");
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
          phone: "",
          profile: user.photoURL,
          cover: coverUrl,
          bio: "",
          gender: "",
          birthday: "",
          relationship: "",
          nickname: "",
          location: "",
          role: "user",
          hobby: [],
          religion: "",
          languages: [],
          work: [],
          education: {
            school: [],
            college: [],
            university: [],
          },
          socialLinks: [],
          website: "",
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
        Welcome Back
      </h2>
      <div className="flex justify-center items-center mt-10">
        <form onSubmit={handleSubmit} className="w-80 space-y-3">
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
          <button className="w-full bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-md">
            {loading ? (
              <span className="loading loading-spinner text-center text-white"></span>
            ) : (
              "Log In"
            )}
          </button>
        </form>
      </div>
      <p className="my-3 text-center text-sm font-semibold">
        Don&apos;t have an Account ?
        <Link to="/signup" className="text-blue-700">
          {" "}
          Sign Up
        </Link>
      </p>
      <div className="flex justify-center">
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

export default SignIn;
