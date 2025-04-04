import useAxiosSecure from "../hooks/useAxiosSecure";
import { imageUpload } from "../utils/utils";
import { useForm } from "react-hook-form";
import { useState } from "react";
import Swal from "sweetalert2";

const PostForm = ({ userData, onPostSuccess }) => {
  const axiosSecure = useAxiosSecure();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    const { caption, image_file } = data;

    if (!caption.trim() && !image_file?.[0]) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Caption or Image is required",
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    const file = image_file ? image_file[0] : null;
    let image = null;
    if (file) image = await imageUpload(file);

    const postInfo = {
      caption,
      image,
      postedAt: new Date().toISOString(),
      liked_by: [],
      comments: [],
      user_id: userData._id,
      approvedStatus: false,
    };

    await axiosSecure.post("/new-post", postInfo).then((res) => {
      if (res.data.insertedId) {
        setLoading(false);
        Swal.fire({
          icon: "success",
          title: "Posting successful. Wait for approval.",
          showConfirmButton: false,
          timer: 1500,
        });
        reset();
        onPostSuccess();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-5 md:mt-20 mb-5">
      <div className="flex flex-col md:flex-row gap-2">
        <img
          className="w-14 h-14 object-cover rounded-full"
          src={userData?.image}
          alt="profile"
        />
        <textarea
          placeholder="What's on your mind?"
          className="mt-2 w-full h-24 md:h-40 border border-black p-3 rounded-xl"
          {...register("caption")}
        ></textarea>
      </div>
      <div className="flex items-center justify-between mt-5">
        <input
          type="file"
          accept="image/*"
          className="md:pl-16"
          {...register("image_file")}
        />
        <button className="w-20 md:w-24 bg-black text-white py-2 px-2 text-xs md:text-base font-bold rounded-md">
          {loading ? (
            <span className="loading loading-spinner text-white"></span>
          ) : (
            "Post"
          )}
        </button>
      </div>
    </form>
  );
};

export default PostForm;
