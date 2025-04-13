import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { updateProfile } from "firebase/auth";
import { imageUpload } from "../utils/utils";
import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";

const Settings = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const { data: userData = {}, isLoading } = useQuery({
    queryKey: ["my-data", user?.email],
    queryFn: async () => {
      try {
        const { data } = await axiosSecure.get(`/user/${user?.email}`);
        return data || {};
      } catch {
        return {};
      }
    },
    enabled: !!user?.email,
  });

  const [profilePreview, setProfilePreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email] = useState(user?.email || "");
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  useEffect(() => {
    setProfilePreview(userData?.profile || user?.photoURL || "");
    setCoverPreview(userData?.cover || "");
    setName(userData?.name || user?.displayName || "");
    setUsername(userData?.username || "");
  }, [userData, user]);

  const checkUsername = async (value) => {
    if (value === userData?.username) {
      setUsernameAvailable(null);
      return;
    }
    try {
      const { data } = await axiosSecure.get(`/user_name/${value}`);
      setUsernameAvailable(data.available);
    } catch {
      setUsernameAvailable(null);
    }
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "profile") {
          setProfilePreview(reader.result);
          setProfileFile(file);
        } else if (type === "cover") {
          setCoverPreview(reader.result);
          setCoverFile(file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (type) => {
    if (type === "profile") {
      setProfilePreview(userData?.profile || user?.photoURL || "");
      setProfileFile(null);
    } else if (type === "cover") {
      setCoverPreview(userData?.cover || "");
      setCoverFile(null);
    }
  };

  const updateMutation = useMutation({
    mutationFn: async (updatedData) => {
      if (updatedData.profileFile) {
        updatedData.profile = await imageUpload(updatedData.profileFile);
        delete updatedData.profileFile;
      }
      if (updatedData.coverFile) {
        updatedData.cover = await imageUpload(updatedData.coverFile);
        delete updatedData.coverFile;
      }

      if (updatedData.name || updatedData.profile) {
        await updateProfile(user, {
          displayName: updatedData.name || user.displayName,
          photoURL: updatedData.profile || user.photoURL,
        });
      }
      const { data } = await axiosSecure.patch(
        `/user/${user?.email}`,
        updatedData
      );
      return data;
    },
    onMutate: async (updatedData) => {
      const previousData = queryClient.getQueryData(["my-data", user?.email]);
      queryClient.setQueryData(["my-data", user?.email], (old) => ({
        ...old,
        name: updatedData.name || old.name,
        username: updatedData.username || old.username,
        profile: updatedData.profile || old.profile,
        cover: updatedData.cover || old.cover,
      }));
      return { previousData };
    },
    onError: (err, updatedData, context) => {
      queryClient.setQueryData(["my-data", user?.email], context.previousData);
      toast.error("Failed to update profile!");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["my-data", user?.email], { exact: true });
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedData = {};

    if (name && name !== userData?.name) {
      if (name.length < 6) {
        toast.error("Name must be at least 6 characters long!");
        return;
      }
      updatedData.name = name;
    }
    if (username && username !== userData?.username && usernameAvailable) {
      if (username.length < 6) {
        toast.error("Username must be at least 6 characters long!");
        return;
      }
      updatedData.username = username;
    }
    if (profilePreview && profilePreview !== userData?.profile) {
      if (profileFile) updatedData.profileFile = profileFile;
      else updatedData.profile = profilePreview;
    }
    if (coverPreview && coverPreview !== userData?.cover) {
      if (coverFile) updatedData.coverFile = coverFile;
      else updatedData.cover = coverPreview;
    }

    if (Object.keys(updatedData).length > 0) {
      updateMutation.mutate(updatedData);
    } else {
      toast.error("No changes detected!");
    }
  };

  if (isLoading || !user?.email) {
    return (
      <div className="my-10 text-center">
        <span className="loading loading-bars loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="mx-5 md:mx-0">
      <div className="relative">
        <div className="relative">
          <img
            className="w-full h-48 md:h-80 lg:h-[450px] object-cover border-2 rounded-xl"
            src={coverPreview || "default-cover.jpg"}
            alt="banner"
          />
          <label className="absolute top-3 right-3 bg-blue-500 text-white px-3 py-1 rounded-md cursor-pointer">
            Edit Banner
            <input
              type="file"
              name="cover"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageChange(e, "cover")}
            />
          </label>
          {coverPreview && coverPreview !== userData?.cover && (
            <button
              onClick={() => handleRemoveImage("cover")}
              className="absolute top-3 right-32 bg-red-500 text-white px-5 py-1 rounded-md"
            >
              Remove
            </button>
          )}
        </div>
        <div className="absolute -bottom-32 md:left-5 flex flex-col md:flex-row items-center md:gap-5">
          <div className="relative">
            <img
              className="w-32 h-32 md:w-40 md:h-40 object-cover border-4 rounded-full"
              src={profilePreview || "default-profile.jpg"}
              alt="profile"
            />
            <label className="absolute -bottom-1 right-0 bg-blue-500 text-white px-3 py-1 rounded-full cursor-pointer">
              Edit Profile
              <input
                type="file"
                name="profile"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleImageChange(e, "profile")}
              />
            </label>
            {profilePreview && profilePreview !== userData?.profile && (
              <button
                onClick={() => handleRemoveImage("profile")}
                className="absolute top-0 right-0 text-red-500 px-2 py-1 rounded-full"
              >
                <i className="fa-solid fa-circle-xmark text-3xl"></i>
              </button>
            )}
          </div>
          <div className="mt-2 text-center md:text-left">
            <h2 className="text-xl font-semibold">{name || "Your Name"}</h2>
            <div className="flex items-center gap-3">
              <p>{userData?.friends?.length || 0} friends</p>
              <p>{userData?.followers?.length || 0} followers</p>
            </div>
          </div>
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        className="mt-36 lg:mt-24 space-y-3 max-w-md mx-auto"
      >
        <div className="relative">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div className="relative">
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              checkUsername(e.target.value);
            }}
            placeholder="Username"
            className="w-full px-3 py-2 border rounded-md pr-10"
          />
          {usernameAvailable === true && (
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
              <i className="fa-solid fa-circle-check text-2xl"></i>
            </span>
          )}
          {usernameAvailable === false && (
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
              <i className="fa-solid fa-circle-xmark text-2xl"></i>
            </span>
          )}
        </div>
        <div className="relative">
          <input
            type="email"
            value={email}
            disabled
            placeholder="Email"
            className="w-full px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          disabled={updateMutation.isLoading}
        >
          {updateMutation.isLoading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default Settings;
