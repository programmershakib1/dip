import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useState } from "react";

const Location = ({ userData, updateUserData }) => {
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      location: userData.location || "",
    },
  });

  const onSubmit = (data) => {
    if (!data.location.trim()) {
      toast.error("Location is required!");
      return;
    }

    updateUserData({ location: data.location.trim() });
    toast.success("Location updated successfully!");
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset({ location: userData.location || "" });
  };

  return (
    <div className="py-5 border-b">
      <h2 className="text-xl font-bold mb-2">Location</h2>
      {!isEditing ? (
        <div className="flex justify-between items-center">
          {userData.location && (
            <p className="text-gray-700">{userData.location}</p>
          )}
          {!userData.location ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-blue-500 hover:text-blue-700"
            >
              Add Location
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-gray-600 hover:text-black"
            >
              <i className="fa-solid fa-pen-to-square"></i>
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <input
            type="text"
            {...register("location", {
              required: "Location is required!",
            })}
            placeholder="Enter location"
            className="w-full px-3 py-2 border rounded-md"
          />
          {errors.location && (
            <p className="text-red-500 text-sm mt-1">
              {errors.location.message}
            </p>
          )}
          <div className="flex gap-2">
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
        </form>
      )}
    </div>
  );
};

export default Location;
