import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ProfileInfo from "../components/settings/ProfileInfo";
import Education from "../components/settings/Education";
import Location from "../components/settings/Location";
import useAxiosSecure from "../hooks/useAxiosSecure";
import Work from "../components/settings/Work";
import { updateProfile } from "firebase/auth";
import { imageUpload } from "../utils/utils";
import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";
import ContactInfo from "../components/settings/ContactInfo";

const Settings = () => {
  const { user, handleSingOut } = useAuth();
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
  const [profileFile, setProfileFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  useEffect(() => {
    setProfilePreview(userData?.profile || user?.photoURL || "");
    setCoverPreview(userData?.cover || "");
  }, [userData, user]);

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
        ...updatedData,
        profile: updatedData.profile || old.profile,
        cover: updatedData.cover || old.cover,
        name: updatedData.name || old.name,
        username: updatedData.username || old.username,
        bio: updatedData.bio || old.bio,
        work: updatedData.work || old.work,
        education: updatedData.education || old.education,
        location: updatedData.location || old.location,
        phone: updatedData.phone || old.phone,
        website: updatedData.website || old.website,
        socialLinks: updatedData.socialLinks || old.socialLinks,
        lastNameChange: updatedData.lastNameChange || old.lastNameChange,
        lastUsernameChange:
          updatedData.lastUsernameChange || old.lastUsernameChange,
      }));
      return { previousData };
    },
    onError: (err, updatedData, context) => {
      queryClient.setQueryData(["my-data", user?.email], context.previousData);
      toast.error("Failed to update!");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["my-data", user?.email], { exact: true });
    },
    onSuccess: () => {
      toast.success("Updated successfully!");
    },
  });

  const handleSaveImages = () => {
    const updatedData = {};
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

  const updateUserData = (data) => {
    updateMutation.mutate(data);
  };

  if (isLoading || !user?.email) {
    return (
      <div className="my-10 text-center">
        <span className="loading loading-bars loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="mx-5 md:mx-0 mb-5">
      <div className="relative">
        <div className="relative">
          {coverPreview ? (
            <img
              className="w-full h-48 md:h-80 lg:h-[450px] object-cover border-2 rounded-xl"
              src={coverPreview || "default-cover.jpg"}
              alt="banner"
            />
          ) : (
            <div className="w-full h-48 md:h-80 lg:h-[450px] flex items-center justify-center border-2 rounded-xl">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          )}
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
          <div className="mt-2">
            <h2 className="text-xl font-semibold">
              {user?.displayName || userData?.name || "Your Name"}
            </h2>
            <div className="flex items-center gap-3">
              <p>{userData?.friends?.length || 0} friends</p>
              <p>{userData?.followers?.length || 0} followers</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-36">
        <button
          onClick={handleSaveImages}
          className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          disabled={updateMutation.isLoading}
        >
          {updateMutation.isLoading ? "Saving..." : "Save Images"}
        </button>
      </div>
      <ProfileInfo
        userData={userData}
        user={user}
        axiosSecure={axiosSecure}
        updateUserData={updateUserData}
      />
      <Work userData={userData} updateUserData={updateUserData}></Work>
      <Education
        userData={userData}
        updateUserData={updateUserData}
      ></Education>
      <Location userData={userData} updateUserData={updateUserData}></Location>
      <ContactInfo
        userData={userData}
        updateUserData={updateUserData}
      ></ContactInfo>
      <div className="flex flex-col gap-3 mt-5">
        <button className="w-full py-2 bg-gray-300 rounded-md hover:bg-gray-400">
          Security
        </button>
        <button className="w-full py-2 bg-gray-300 rounded-md hover:bg-gray-400">
          Support
        </button>
        <button className="w-full py-2 bg-gray-300 rounded-md hover:bg-gray-400">
          Terms & Policies
        </button>
        <a
          href="https://programmer-shakib.web.app"
          target="_blank"
          className="w-full py-2 bg-gray-300 rounded-md hover:bg-gray-400 text-center"
        >
          Developer info
        </a>
        <button
          onClick={handleSingOut}
          className="w-full py-2 bg-gray-300 rounded-md hover:bg-gray-400"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Settings;
