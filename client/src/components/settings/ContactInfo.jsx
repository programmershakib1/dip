import { useForm } from "react-hook-form";
import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

const ContactInfo = ({ userData, updateUserData }) => {
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingWebsite, setIsEditingWebsite] = useState(false);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState(null);
  const [, setShowDeleteModal] = useState(false);
  const [deleteLinkId, setDeleteLinkId] = useState(null);
  const deleteModalRef = useRef(null);

  const {
    register: registerPhone,
    handleSubmit: handleSubmitPhone,
    formState: { errors: phoneErrors },
    reset: resetPhone,
  } = useForm({
    defaultValues: {
      phone: userData.phone || "",
    },
  });

  const {
    register: registerWebsite,
    handleSubmit: handleSubmitWebsite,
    formState: { errors: websiteErrors },
    reset: resetWebsite,
  } = useForm({
    defaultValues: {
      website: userData.website || "",
    },
  });

  const {
    register: registerLink,
    handleSubmit: handleSubmitLink,
    formState: { errors: linkErrors },
    reset: resetLink,
    setValue: setLinkValue,
  } = useForm({
    defaultValues: {
      platform: "",
      username: "",
    },
  });

  const platformConfig = [
    {
      id: "facebook",
      label: "Facebook",
      url: "https://www.facebook.com/",
      icon: "fa-brands fa-facebook",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/",
      icon: "fa-brands fa-linkedin",
    },
    {
      id: "github",
      label: "GitHub",
      url: "https://github.com/",
      icon: "fa-brands fa-github",
    },
    {
      id: "youtube",
      label: "YouTube",
      url: "https://www.youtube.com/@",
      icon: "fa-brands fa-youtube",
    },
    {
      id: "twitter",
      label: "Twitter",
      url: "https://twitter.com/",
      icon: "fa-brands fa-twitter",
    },
    {
      id: "instagram",
      label: "Instagram",
      url: "https://www.instagram.com/",
      icon: "fa-brands fa-instagram",
    },
  ];

  // Phone handlers
  const handleAddPhoneClick = () => {
    setIsEditingPhone(true);
    resetPhone({ phone: userData.phone || "" });
  };

  const onSubmitPhone = (data) => {
    if (!data.phone.trim()) {
      toast.error("Phone number is required!");
      return;
    }
    updateUserData({ phone: data.phone.trim() });
    toast.success("Phone updated successfully!");
    setIsEditingPhone(false);
  };

  const handleCancelPhone = () => {
    setIsEditingPhone(false);
    resetPhone({ phone: userData.phone || "" });
  };

  // Website handlers
  const handleAddWebsiteClick = () => {
    setIsEditingWebsite(true);
    resetWebsite({ website: userData.website || "" });
  };

  const onSubmitWebsite = (data) => {
    if (!data.website.trim()) {
      toast.error("Website is required!");
      return;
    }
    updateUserData({ website: data.website.trim() });
    toast.success("Website updated successfully!");
    setIsEditingWebsite(false);
  };

  const handleCancelWebsite = () => {
    setIsEditingWebsite(false);
    resetWebsite({ website: userData.website || "" });
  };

  // Social Link handlers
  const handleAddLinkClick = () => {
    setIsAddingLink(true);
    resetLink({ platform: "", username: "" });
  };

  const handleEditLink = (link) => {
    setEditingLinkId(link._id);
    setLinkValue("platform", link.platform);
    setLinkValue("username", link.username);
  };

  const handleDeleteLink = (linkId) => {
    setDeleteLinkId(linkId);
    setShowDeleteModal(true);
    deleteModalRef.current?.showModal();
  };

  const confirmDeleteLink = () => {
    const updatedSocialLinks = userData.socialLinks.filter(
      (link) => link._id !== deleteLinkId
    );
    updateUserData({ socialLinks: updatedSocialLinks });
    toast.success("Social link deleted successfully!");
    setShowDeleteModal(false);
    setDeleteLinkId(null);
    deleteModalRef.current?.close();
  };

  const cancelDeleteLink = () => {
    setShowDeleteModal(false);
    setDeleteLinkId(null);
    deleteModalRef.current?.close();
  };

  const onSubmitLink = (data) => {
    if (!data.platform || !data.username.trim()) {
      toast.error("Platform and username are required!");
      return;
    }

    const platform = platformConfig.find((p) => p.id === data.platform);
    const newLink = {
      _id: editingLinkId || uuidv4(),
      platform: data.platform,
      username: data.username.trim(),
      url: `${platform.url}${data.username.trim()}`,
      icon: platform.icon,
    };

    let updatedSocialLinks = [...(userData.socialLinks || [])];

    if (editingLinkId) {
      updatedSocialLinks = updatedSocialLinks.map((link) =>
        link._id === editingLinkId ? newLink : link
      );
      toast.success("Social link updated successfully!");
    } else {
      updatedSocialLinks = [newLink, ...updatedSocialLinks];
      toast.success("Social link added successfully!");
    }

    updateUserData({ socialLinks: updatedSocialLinks });
    setIsAddingLink(false);
    setEditingLinkId(null);
    resetLink();
  };

  const handleCancelLink = () => {
    setIsAddingLink(false);
    setEditingLinkId(null);
    resetLink();
  };

  return (
    <div className="py-5 border-b">
      <h2 className="text-xl font-bold mb-2">Contact Info</h2>
      {/* Phone Section */}
      <div className="mb-4">
        <h3 className="text-sm font-medium">Phone</h3>
        {!isEditingPhone ? (
          <div className="flex justify-between items-center mt-2">
            {userData.phone && (
              <p className="text-gray-700">{userData.phone}</p>
            )}
            {!userData.phone && !isEditingPhone ? (
              <button
                type="button"
                onClick={handleAddPhoneClick}
                className="text-blue-500 hover:text-blue-700"
              >
                Add Phone
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAddPhoneClick}
                className="text-gray-600 hover:text-black"
              >
                <i className="fa-solid fa-pen-to-square"></i>
              </button>
            )}
          </div>
        ) : (
          <form
            onSubmit={handleSubmitPhone(onSubmitPhone)}
            className="space-y-2 mt-2"
          >
            <input
              type="text"
              {...registerPhone("phone", {
                required: "Phone number is required!",
              })}
              placeholder="Enter phone number"
              className="w-full px-3 py-2 border rounded-md"
            />
            {phoneErrors.phone && (
              <p className="text-red-500 text-sm mt-1">
                {phoneErrors.phone.message}
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
                onClick={handleCancelPhone}
                className="w-1/2 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Website Section */}
      <div className="mb-4">
        <h3 className="text-sm font-medium">Website</h3>
        {!isEditingWebsite ? (
          <div className="flex justify-between items-center mt-2">
            {userData.website && (
              <p className="text-gray-700">{userData.website}</p>
            )}
            {!userData.website && !isEditingWebsite ? (
              <button
                type="button"
                onClick={handleAddWebsiteClick}
                className="text-blue-500 hover:text-blue-700"
              >
                Add Website
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAddWebsiteClick}
                className="text-gray-600 hover:text-black"
              >
                <i className="fa-solid fa-pen-to-square"></i>
              </button>
            )}
          </div>
        ) : (
          <form
            onSubmit={handleSubmitWebsite(onSubmitWebsite)}
            className="space-y-2 mt-2"
          >
            <input
              type="text"
              {...registerWebsite("website", {
                required: "Website is required!",
              })}
              placeholder="Enter website URL"
              className="w-full px-3 py-2 border rounded-md"
            />
            {websiteErrors.website && (
              <p className="text-red-500 text-sm mt-1">
                {websiteErrors.website.message}
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
                onClick={handleCancelWebsite}
                className="w-1/2 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Social Links Section */}
      <div>
        <h3 className="text-sm font-medium">Social Links</h3>
        {userData.socialLinks?.length > 0 && (
          <div className="space-y-2 mt-2">
            {userData.socialLinks.map((link) => (
              <div key={link._id} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <i className={link?.icon}></i>
                    <p>{link?.username}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditLink(link)}
                    className="text-gray-600 hover:text-black"
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteLink(link._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {!(isAddingLink || editingLinkId) && (
          <button
            onClick={handleAddLinkClick}
            className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mt-2"
          >
            Add Social Link
          </button>
        )}
        {(isAddingLink || editingLinkId) && (
          <form
            onSubmit={handleSubmitLink(onSubmitLink)}
            className="space-y-2 mt-2"
          >
            <div className="flex items-center gap-2">
              <select
                {...registerLink("platform", {
                  required: "Platform is required!",
                })}
                className="w-1/3 px-3 py-2 border rounded-md"
              >
                <option value="" disabled>
                  Select Platform
                </option>
                {platformConfig.map((platform) => (
                  <option key={platform.id} value={platform.id}>
                    {platform.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                {...registerLink("username", {
                  required: "Username is required!",
                })}
                placeholder="Enter username"
                className="w-2/3 px-3 py-2 border rounded-md"
              />
            </div>
            {linkErrors.platform && (
              <p className="text-red-500 text-sm mt-1">
                {linkErrors.platform.message}
              </p>
            )}
            {linkErrors.username && (
              <p className="text-red-500 text-sm mt-1">
                {linkErrors.username.message}
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
                onClick={handleCancelLink}
                className="w-1/2 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
      {/* Delete Confirmation Modal */}
      <dialog id="delete_modal" className="modal" ref={deleteModalRef}>
        <div className="modal-box">
          <p>Are you sure?</p>
          <div className="flex justify-end gap-5 mt-5">
            <form method="dialog">
              <button
                onClick={cancelDeleteLink}
                className="text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </form>
            <button
              onClick={confirmDeleteLink}
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

export default ContactInfo;
