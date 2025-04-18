import { useForm } from "react-hook-form";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

const Education = ({ userData, updateUserData }) => {
  const [editingEducationId, setEditingEducationId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [, setShowDeleteModal] = useState(false);
  const [deleteEducation, setDeleteEducation] = useState(null);
  const deleteModalRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      type: "",
      name: "",
      completed: false,
    },
  });

  const handleAddEducationClick = () => {
    setIsAdding(true);
    reset({ type: "", name: "", completed: false });
  };

  const handleEditEducation = (edu, type) => {
    setEditingEducationId(edu._id);
    setValue("type", type);
    setValue("name", edu.name);
    setValue("completed", edu.completed);
  };

  const handleDeleteEducation = (eduId, type) => {
    setDeleteEducation({ id: eduId, type });
    setShowDeleteModal(true);
    deleteModalRef.current?.showModal();
  };

  const confirmDelete = () => {
    if (!deleteEducation) return;
    const { id, type } = deleteEducation;
    const updatedEducation = {
      ...userData.education,
      [type]: userData.education[type].filter((e) => e._id !== id),
    };
    updateUserData({ education: updatedEducation });
    toast.success("Education deleted successfully!");
    setShowDeleteModal(false);
    setDeleteEducation(null);
    deleteModalRef.current?.close();
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteEducation(null);
    deleteModalRef.current?.close();
  };

  const onSubmit = (data) => {
    if (!data.name.trim()) {
      toast.error("Institution name is required!");
      return;
    }

    const newEducation = {
      _id: editingEducationId || uuidv4(),
      name: data.name.trim(),
      completed: data.completed,
    };

    const updatedEducation = { ...userData.education };

    if (editingEducationId) {
      const currentType = userData.education.school.find(
        (e) => e._id === editingEducationId
      )
        ? "school"
        : userData.education.college.find((e) => e._id === editingEducationId)
        ? "college"
        : "university";
      if (currentType !== data.type) {
        updatedEducation[currentType] = updatedEducation[currentType].filter(
          (e) => e._id !== editingEducationId
        );
        updatedEducation[data.type] = [
          newEducation,
          ...(updatedEducation[data.type] || []),
        ];
      } else {
        updatedEducation[data.type] = updatedEducation[data.type].map((e) =>
          e._id === editingEducationId ? newEducation : e
        );
      }
      toast.success("Education updated successfully!");
    } else {
      updatedEducation[data.type] = [
        newEducation,
        ...(updatedEducation[data.type] || []),
      ];
      toast.success("Education added successfully!");
    }

    updateUserData({ education: updatedEducation });
    setEditingEducationId(null);
    setIsAdding(false);
    reset();
  };

  const handleCancel = () => {
    setEditingEducationId(null);
    setIsAdding(false);
    reset();
  };

  const educationSections = [
    {
      type: "university",
      title: "University",
      data: userData.education?.university || [],
    },
    {
      type: "college",
      title: "College",
      data: userData.education?.college || [],
    },
    { type: "school", title: "School", data: userData.education?.school || [] },
  ];

  return (
    <div className="py-5 border-b">
      <h2 className="text-xl font-bold mb-2">Education</h2>
      {educationSections.map((section, idx) =>
        section.data.length > 0 ? (
          <div key={idx} className="mb-4">
            <h3 className="text-sm font-medium">{section.title}</h3>
            <div className="space-y-2 mt-2">
              {section.data.map((edu) => (
                <div
                  key={edu._id}
                  className="flex justify-between items-center"
                >
                  <p className="text-gray-700">
                    {edu.completed ? "Studied at" : "Studies at"} {edu.name}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditEducation(edu, section.type)}
                      className="text-gray-600 hover:text-black"
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteEducation(edu._id, section.type)
                      }
                      className="text-red-500 hover:text-red-700"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null
      )}
      {!(isAdding || editingEducationId) && (
        <button
          onClick={handleAddEducationClick}
          className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Add Education
        </button>
      )}
      {(isAdding || editingEducationId) && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <div className="flex items-center gap-2">
            <select
              {...register("type", {
                required: "Please select an education type!",
              })}
              className="w-1/3 px-3 py-2 border rounded-md"
            >
              <option value="" disabled>
                Select Type
              </option>
              <option value="school">School</option>
              <option value="college">College</option>
              <option value="university">University</option>
            </select>
            <input
              type="text"
              {...register("name", {
                required: "Institution name is required!",
              })}
              placeholder="Institution Name"
              className="w-2/3 px-3 py-2 border rounded-md"
            />
          </div>
          {errors.type && (
            <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
          )}
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("completed")}
              className="h-4 w-4"
            />
            <span className="text-gray-700">Completed</span>
          </label>
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

export default Education;
