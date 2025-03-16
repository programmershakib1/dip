import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import useAxiosPublic from "./../../hooks/useAxiosPublic";
import { auth } from "../../firebase/firebase.config";
import { Link, useNavigate } from "react-router-dom";
import { imageUpload } from "../../utils/utils";
import { updateProfile } from "firebase/auth";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";
import { useState } from "react";

const SignUp = () => {
  const { handleSignUp, handleGoogleLogin, setUser, locations, setLocations } =
    useAuth();
  const navigate = useNavigate();
  const axiosPublic = useAxiosPublic();
  const [loading, setLoading] = useState(false);
  const [uploadImage, setUploadImage] = useState();
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [userNameCheckLoading, setUserNameCheckLoading] = useState(false);

  const handleUsernameChange = async (e) => {
    setUserNameCheckLoading(true);
    if (e.target.value.length === 0) {
      setUserNameCheckLoading(false);
      setUsernameAvailable(null);
      return;
    }
    const enteredUsername = e.target.value;
    if (enteredUsername.length < 5) {
      setUsernameAvailable(null);
      return;
    }
    try {
      const { data } = await axiosPublic.get(`/username/${enteredUsername}`);
      setUsernameAvailable(data.length === 0);
      setUserNameCheckLoading(false);
    } catch (error) {
      setUserNameCheckLoading(false);
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    const name = e.target.name.value;
    const username = e.target.username.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    if (!uploadImage || !uploadImage.image) {
      setLoading(false);
      toast.error("Please upload a profile photo.");
      return;
    }

    if (
      password.length < 6 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    )
      return (
        setLoading(false),
        toast.error(
          password.length < 6
            ? "Password must be 6 characters long"
            : !/[A-Z]/.test(password)
            ? "Password must contain at least one uppercase letter"
            : !/[a-z]/.test(password)
            ? "Password must contain at least one lowercase letter"
            : "Password must contain at least one special character"
        )
      );

    const imageUrl = await imageUpload(uploadImage.image);

    const userInfo = {
      name,
      username,
      email,
      image: imageUrl,
      created_at: new Date().toISOString(),
    };

    const { user } = await axiosPublic.get(`/user/${email}`);

    if (!user) {
      await axiosPublic.post(`/user`, userInfo);
    } else {
      toast.error("User already exists");
      return;
    }

    handleSignUp(email, password)
      .then((result) => {
        e.target.reset();
        setUser(result?.user);
        updateProfile(auth.currentUser, {
          displayName: name,
          photoURL: imageUrl,
        });
        setUser({ displayName: name, photoURL: imageUrl });
        setLoading(false);
        toast.success("User Signup Successful");
        navigate(locations ? locations : "/");
      })
      .catch((error) => {
        e.target.reset();
        setUploadImage(null);
        setLoading(false);
        toast.error(error?.code);
      });
  };

  const handleGoogleSignUp = async () => {
    try {
      const result = await handleGoogleLogin();
      const user = result?.user;

      if (!user) {
        toast.error("Google Sign In Failed!");
        return;
      }

      const { data } = await axiosPublic.get(`/user/${user.email}`);

      if (!data) {
        const userInfo = {
          name: user.displayName,
          username: null,
          email: user.email,
          image: user.photoURL,
          created_at: new Date().toISOString(),
        };

        await axiosPublic.post(`/user`, userInfo);
      }

      setUser(user);
      toast.success("User Signup Successful");

      if (!data?.username) {
        document.getElementById("my_modal_5").showModal();
      } else {
        navigate(locations ? locations : "/");
      }
    } catch (error) {
      toast.error(error?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUserNameSubmit = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const email = auth.currentUser.email;
    await axiosPublic
      .patch(`/username/${email}`, { username })
      .then((res) => {
        if (res.data.modifiedCount > 0) {
          toast.success("User name added successfully");
        }
        document.getElementById("my_modal_5").close();
        toast.success("User Signup Successful");
        navigate(locations ? locations : "/");
      })
      .catch((error) => {
        console.error("Failed to update user name:", error);
      });
  };

  const handleLocations = () => {
    setLocations(locations);
  };

  return (
    <div className="min-h-screen flex flex-col items-center mt-10 md:mt-20">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center w-full"
      >
        <div className="relative w-36 h-36 border-2 border-black dark:border-white rounded-full flex justify-center items-center">
          <label
            htmlFor="profilePhoto"
            className="w-full h-full flex items-center justify-center rounded-full cursor-pointer"
          >
            {uploadImage ? (
              <img
                className="w-full h-full rounded-full object-cover"
                src={uploadImage?.url}
                alt="Uploaded profile"
              />
            ) : (
              <h4 className="text-xl font-semibold">Profile</h4>
            )}
          </label>
          <input
            id="profilePhoto"
            type="file"
            name="image"
            accept="image/*"
            className="hidden"
            onChange={(e) =>
              setUploadImage({
                image: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0]),
              })
            }
          />
        </div>
        <div className="flex flex-col w-4/5 md:w-1/2 lg:w-1/4 mx-auto">
          <label>
            <span className="font-semibold">Name</span>
          </label>
          <input
            name="name"
            type="text"
            placeholder="Name"
            className="py-3 rounded-full shadow-md mt-1 pl-3 dark:bg-c"
            required
          />
        </div>
        <div className="flex flex-col w-4/5 md:w-1/2 lg:w-1/4 mx-auto mt-2">
          <label>
            <span className="font-semibold">User Name</span>
          </label>
          <div className="relative">
            <input
              name="username"
              type="text"
              placeholder="User Name"
              className="py-3 rounded-full shadow-md mt-1 pl-3 pr-10 dark:bg-c w-full"
              onChange={handleUsernameChange}
              required
            />
            {userNameCheckLoading ? (
              <span className="loading loading-spinner loading-md absolute right-5 top-7 transform -translate-y-1/2"></span>
            ) : (
              <>
                {usernameAvailable !== null && (
                  <span className="absolute right-5 top-7 transform -translate-y-1/2">
                    {usernameAvailable ? (
                      <FaCheckCircle className="text-green-500 text-2xl" />
                    ) : (
                      <FaTimesCircle className="text-red-500 text-2xl" />
                    )}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col w-4/5 md:w-1/2 lg:w-1/4 mx-auto mt-2">
          <label>
            <span className="font-semibold">Email</span>
          </label>
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="py-3 rounded-full shadow-md mt-1 pl-3 dark:bg-c"
            required
          />
        </div>
        <div className="flex flex-col w-4/5 md:w-1/2 lg:w-1/4 mx-auto mt-2">
          <label>
            <span className="font-semibold">Password</span>
          </label>
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="py-3 rounded-full shadow-md mt-1 pl-3 dark:bg-c"
            required
          />
        </div>
        <button className="bg-black py-0.5 px-6 text-white dark:bg-c  rounded-full font-bold mt-5">
          {loading ? (
            <div className="flex justify-center items-center">
              <span className="loading loading-spinner text-white"></span>
            </div>
          ) : (
            "Sign Up"
          )}
        </button>
      </form>
      <div>
        <p className="pt-2 text-center text-sm font-semibold">
          Already have an Account?
          <Link to="/signIn" onClick={handleLocations} className="underline">
            {" "}
            Sign In
          </Link>
        </p>
        <div className="flex flex-col md:flex-row gap-2">
          <button
            onClick={handleGoogleSignUp}
            className="bg-black py-2 px-6 text-white dark:bg-c rounded-full font-bold mt-5"
          >
            <i className="fa-brands fa-google text-white pr-2"></i>
            Google
          </button>
        </div>
      </div>
      {/* username set modal */}
      <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <form onSubmit={handleUserNameSubmit}>
            <div className="relative">
              <input
                name="username"
                type="text"
                placeholder="User Name"
                className="border border-black py-3 rounded-full mt-1 pl-3 pr-10 dark:bg-c w-full"
                onChange={handleUsernameChange}
                required
              />
              {userNameCheckLoading ? (
                <span className="loading loading-spinner loading-md absolute right-5 top-7 transform -translate-y-1/2"></span>
              ) : (
                <>
                  {usernameAvailable !== null && (
                    <span className="absolute right-5 top-7 transform -translate-y-1/2">
                      {usernameAvailable ? (
                        <FaCheckCircle className="text-green-500 text-2xl" />
                      ) : (
                        <FaTimesCircle className="text-red-500 text-2xl" />
                      )}
                    </span>
                  )}
                </>
              )}
            </div>
            <div className="flex justify-center mt-5">
              <button className="bg-black text-white py-2 px-6 font-bold rounded-sm">
                Submit
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
};

export default SignUp;
