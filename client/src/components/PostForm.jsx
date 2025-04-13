import useAxiosSecure from "../hooks/useAxiosSecure";
import { imageUpload } from "../utils/utils";
import { useForm } from "react-hook-form";
import { useState } from "react";
import Swal from "sweetalert2";

const PostForm = ({ userData, onPostSuccess }) => {
  const axiosSecure = useAxiosSecure();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setSelectedFile(file);
    }
  };

  const handleImageRemove = () => {
    setImagePreview(null);
    setSelectedFile(null);
    document.getElementById("image_file").value = "";
  };

  const onSubmit = async (data) => {
    setLoading(true);
    const { caption } = data;

    if (!caption.trim() && !selectedFile) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Caption or Image is required",
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    let image = null;
    if (selectedFile) {
      image = await imageUpload(selectedFile);
      URL.revokeObjectURL(imagePreview);
    }

    const postInfo = {
      caption,
      image,
      postedAt: new Date().toISOString(),
      liked_by: [],
      comments: [],
      shared: [],
      user_id: userData._id,
      approvedStatus: false,
    };

    await axiosSecure
      .post("/new-post", postInfo)
      .then((res) => {
        if (res.data.insertedId) {
          setLoading(false);
          Swal.fire({
            icon: "success",
            title: "Posting successful. Wait for approval.",
            showConfirmButton: false,
            timer: 1500,
          });
          reset();
          setImagePreview(null);
          setSelectedFile(null);
          setModalOpen(false);
          onPostSuccess();
        }
      })
      .catch((error) => {
        setLoading(false);
        Swal.fire({
          icon: "error",
          title: "Failed to post",
          text: error.message,
          showConfirmButton: true,
        });
      });
  };

  return (
    <div className="mx-5 md:mx-0 mb-5 md:mb-10">
      <div className="flex items-center gap-2 rounded-lg">
        <img
          className="w-11 h-11 md:w-14 md:h-14 object-cover rounded-full"
          src={userData?.profile}
          alt="profile"
        />
        <div
          onClick={() => setModalOpen(true)}
          className="flex-1 bg-gray-100 rounded-full py-2 md:py-4 px-6 text-gray-500 cursor-pointer"
        >
          What's on your mind?
        </div>
      </div>

      {/* post modal */}
      <dialog
        open={modalOpen}
        className={`modal ${modalOpen ? "modal-open" : ""}`}
      >
        <div className="modal-box w-11/12 max-w-lg">
          <div className="flex items-center gap-2 border-b pb-2">
            <img
              className="w-10 h-10 object-cover rounded-full"
              src={userData?.profile}
              alt="profile"
            />
            <span className="font-semibold">{userData?.name}</span>
          </div>
          {/* form */}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-2">
            <textarea
              placeholder="What's on your mind?"
              className="w-full h-24 py-2 px-3 rounded-xl"
              {...register("caption")}
            ></textarea>
            {/* image preview */}
            {imagePreview && (
              <div className="relative mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-auto rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleImageRemove}
                  className="absolute top-2 right-2 bg-gray-800 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            )}
            {/* image input */}
            <div className="mt-2">
              <label className="flex items-center gap-2 cursor-pointer text-gray-600">
                <i className="fa-solid fa-image text-xl"></i>
                <span>Add Photo</span>
                <input
                  id="image_file"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            {/* submit button */}
            <div className="modal-action mt-4">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner text-white"></span>
                ) : (
                  "Post"
                )}
              </button>
            </div>
          </form>
          {/* close button */}
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            onClick={() => setModalOpen(false)}
          >
            <i className="fa-solid fa-circle-xmark text-2xl"></i>
          </button>
        </div>
      </dialog>
    </div>
  );
};

export default PostForm;
