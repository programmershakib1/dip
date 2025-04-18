import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const ProfileInfo = ({ userData, user, axiosSecure, updateUserData }) => {
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [editingField, setEditingField] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      username: "",
      bio: "",
    },
  });

  useEffect(() => {
    setValue("name", userData?.name || user?.displayName || "");
    setValue("username", userData?.username || "");
    setValue("bio", userData?.bio || "");
  }, [userData, user, setValue]);

  const usernameValue = watch("username");

  useEffect(() => {
    const checkUsername = async (value) => {
      if (!value || value === userData?.username) {
        setUsernameAvailable(null);
        setIsCheckingUsername(false);
        return;
      }
      setIsCheckingUsername(true);
      try {
        const { data } = await axiosSecure.get(`/user_name/${value}`);
        setUsernameAvailable(data.available);
      } catch {
        setUsernameAvailable(null);
      } finally {
        setIsCheckingUsername(false);
      }
    };
    checkUsername(usernameValue);
  }, [usernameValue, userData, axiosSecure]);

  const canChangeName = () => {
    if (!userData?.lastNameChange) return true;
    const lastChange = new Date(userData.lastNameChange);
    const now = new Date();
    const diffDays = (now - lastChange) / (1000 * 60 * 60 * 24);
    return diffDays >= 10;
  };

  const getRemainingDays = () => {
    if (!userData?.lastNameChange) return 0;
    const lastChange = new Date(userData.lastNameChange);
    const now = new Date();
    const diffDays = (now - lastChange) / (1000 * 60 * 60 * 24);
    return Math.ceil(10 - diffDays);
  };

  const canChangeUsername = () => {
    if (!userData?.lastUsernameChange) return true;
    const lastChange = new Date(userData.lastUsernameChange);
    const now = new Date();
    const diffDays = (now - lastChange) / (1000 * 60 * 60 * 24);
    return diffDays >= 10;
  };

  const getUsernameRemainingDays = () => {
    if (!userData?.lastUsernameChange) return 0;
    const lastChange = new Date(userData.lastUsernameChange);
    const now = new Date();
    const diffDays = (now - lastChange) / (1000 * 60 * 60 * 24);
    return Math.ceil(10 - diffDays);
  };

  const onSubmit = (data) => {
    const updatedData = {};

    if (editingField === "name" && data.name && data.name !== userData?.name) {
      if (!canChangeName()) {
        toast.error(
          `You can change your name again after ${getRemainingDays()} days!`
        );
        return;
      }
      updatedData.name = data.name;
      updatedData.lastNameChange = new Date().toISOString();
    }

    if (
      editingField === "username" &&
      data.username &&
      data.username !== userData?.username
    ) {
      if (!canChangeUsername()) {
        toast.error(
          `You can change your username again after ${getUsernameRemainingDays()} days!`
        );
        return;
      }
      if (!usernameAvailable) {
        toast.error("Username is not available!");
        return;
      }
      updatedData.username = data.username;
      updatedData.lastUsernameChange = new Date().toISOString();
    }

    if (editingField === "bio" && data.bio !== userData?.bio) {
      updatedData.bio = data.bio;
    }

    if (Object.keys(updatedData).length > 0) {
      updateUserData(updatedData);
      setEditingField(null);
    } else {
      toast.error("No changes detected!");
      setEditingField(null);
    }
  };

  const handleCancel = () => {
    reset({
      name: userData?.name || user?.displayName || "",
      username: userData?.username || "",
      bio: userData?.bio || "",
    });
    setEditingField(null);
    setUsernameAvailable(null);
  };

  const handleNameEditClick = () => {
    if (!canChangeName()) {
      toast.error(
        `You can change your name again after ${getRemainingDays()} days!`
      );
      return;
    }
    setEditingField("name");
  };

  const handleUsernameEditClick = () => {
    if (!canChangeUsername()) {
      toast.error(
        `You can change your username again after ${getUsernameRemainingDays()} days!`
      );
      return;
    }
    setEditingField("username");
  };

  return (
    <div className="py-5 border-b">
      <h2 className="text-xl font-bold mb-2">Profile Info</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        {/* name */}
        <div className="relative">
          {editingField === "name" ? (
            <>
              <input
                type="text"
                {...register("name", {
                  minLength: {
                    value: 5,
                    message: "Name must be at least 5 characters long!",
                  },
                  maxLength: {
                    value: 20,
                    message: "Name cannot exceed 20 characters!",
                  },
                })}
                placeholder="Name"
                className="w-full px-3 py-2 border rounded-md"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-1/2 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="flex justify-between items-center">
              <p className="text-gray-700">
                {userData?.name || user?.displayName || "No name set"}
              </p>
              <button
                type="button"
                onClick={handleNameEditClick}
                className={`text-gray-600 hover:text-black ${
                  !canChangeName() ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <i className="fa-solid fa-pen-to-square"></i>
              </button>
            </div>
          )}
        </div>
        {/* username */}
        <div className="relative">
          {editingField === "username" ? (
            <>
              <input
                type="text"
                {...register("username", {
                  minLength: {
                    value: 6,
                    message: "Username must be at least 6 characters long!",
                  },
                  maxLength: {
                    value: 20,
                    message: "Username cannot exceed 20 characters!",
                  },
                })}
                placeholder="Username"
                className="w-full px-3 py-2 border rounded-md pr-10"
              />
              {isCheckingUsername && (
                <span className="absolute right-3 top-[21px] transform -translate-y-1/2">
                  <span className="loading loading-spinner loading-md"></span>
                </span>
              )}
              {!isCheckingUsername &&
                usernameValue &&
                usernameValue !== userData?.username &&
                usernameAvailable === true &&
                usernameValue.length >= 6 &&
                usernameValue.length <= 20 && (
                  <span className="absolute right-3 top-[21px] transform -translate-y-1/2 text-green-500">
                    <i className="fa-solid fa-circle-check text-2xl"></i>
                  </span>
                )}
              {!isCheckingUsername &&
                usernameValue &&
                usernameValue !== userData?.username &&
                (usernameAvailable === false ||
                  usernameValue.length < 6 ||
                  usernameValue.length > 20) && (
                  <span className="absolute right-3 top-[21px] transform -translate-y-1/2 text-red-500">
                    <i className="fa-solid fa-circle-xmark text-2xl"></i>
                  </span>
                )}
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.username.message}
                </p>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-1/2 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="flex justify-between items-center">
              <p className="text-gray-700">
                @{userData?.username || "No username set"}
              </p>
              <button
                type="button"
                onClick={handleUsernameEditClick}
                className={`text-gray-600 hover:text-black ${
                  !canChangeUsername() ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <i className="fa-solid fa-pen-to-square"></i>
              </button>
            </div>
          )}
        </div>
        {/* bio */}
        <div className="relative">
          {editingField === "bio" ? (
            <>
              <textarea
                {...register("bio", {
                  maxLength: {
                    value: 200,
                    message: "Bio cannot exceed 200 characters!",
                  },
                })}
                placeholder="Bio"
                className="w-full px-3 py-2 border rounded-md"
                rows="4"
              ></textarea>
              {errors.bio && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.bio.message}
                </p>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-1/2 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="flex justify-between items-center">
              <p className="text-gray-700">{userData?.bio || "No bio set"}</p>
              <button
                type="button"
                onClick={() => setEditingField("bio")}
                className="text-gray-600 hover:text-black"
              >
                <i className="fa-solid fa-pen-to-square"></i>
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProfileInfo;
