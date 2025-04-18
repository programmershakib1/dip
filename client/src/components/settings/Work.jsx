import { useForm } from "react-hook-form";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

const Work = ({ userData, updateUserData }) => {
  const [editingWorkId, setEditingWorkId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [, setShowDeleteModal] = useState(false);
  const [deleteWorkId, setDeleteWorkId] = useState(null);
  const deleteModalRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      title: "",
      company: "",
    },
  });

  const handleAddWorkClick = () => {
    setIsAdding(true);
    reset({ title: "", company: "" });
  };

  const handleEditWork = (work) => {
    setEditingWorkId(work._id);
    setValue("title", work.title || "");
    setValue("company", work.company);
  };

  const handleDeleteWork = (workId) => {
    setDeleteWorkId(workId);
    setShowDeleteModal(true);
    deleteModalRef.current?.showModal();
  };

  const confirmDelete = () => {
    if (!deleteWorkId) return;
    const updatedWork = userData.work.filter((w) => w._id !== deleteWorkId);
    updateUserData({ work: updatedWork });
    toast.success("Work deleted successfully!");
    setShowDeleteModal(false);
    setDeleteWorkId(null);
    deleteModalRef.current?.close();
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteWorkId(null);
    deleteModalRef.current?.close();
  };

  const onSubmit = (data) => {
    if (!data.company.trim()) {
      toast.error("Work is required!");
      return;
    }

    const newWork = {
      _id: editingWorkId || uuidv4(),
      company: data.company.trim(),
      ...(data.title.trim() && { title: data.title.trim() }),
    };

    let updatedWork;
    if (editingWorkId) {
      updatedWork = userData.work.map((w) =>
        w._id === editingWorkId ? newWork : w
      );
      toast.success("Work updated successfully!");
    } else {
      updatedWork = [...(userData.work || []), newWork];
      toast.success("Work added successfully!");
    }

    updateUserData({ work: updatedWork });
    setEditingWorkId(null);
    setIsAdding(false);
    reset();
  };

  const handleCancel = () => {
    setEditingWorkId(null);
    setIsAdding(false);
    reset();
  };

  return (
    <div className="py-5 border-b">
      <h2 className="text-xl font-bold mb-2">Work</h2>
      {userData?.work?.length > 0 && (
        <div className="space-y-2 mb-4">
          {userData.work.map((work) => (
            <div key={work._id} className="flex justify-between items-center">
              <p className="text-gray-700">
                {work.title
                  ? `${work.title} at ${work.company}`
                  : `Work at ${work.company}`}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleEditWork(work)}
                  className="text-gray-600 hover:text-black"
                >
                  <i className="fa-solid fa-pen-to-square"></i>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteWork(work._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {!(isAdding || editingWorkId) && (
        <button
          onClick={handleAddWorkClick}
          className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Add Work experience
        </button>
      )}
      {(isAdding || editingWorkId) && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              {...register("title")}
              placeholder="Title (Optional)"
              className="w-full px-3 py-2 border rounded-md"
            />
            <span className="text-gray-700">at</span>
            <input
              type="text"
              {...register("company", {
                required: "Work is required!",
              })}
              placeholder="Work"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          {errors.company && (
            <p className="text-red-500 text-sm mt-1">
              {errors.company.message}
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
      <dialog id="delete_modal" className="modal" ref={deleteModalRef}>
        <div className="modal-box">
          <p>Are you sure?</p>
          <div className="flex justify-end gap-5 mt-5">
            <form method="dialog">
              <button
                onClick={cancelDelete}
                className="text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </form>
            <button
              onClick={confirmDelete}
              className="text-blue-600 hover:text-blue-800"
            >
              Delete
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default Work;
