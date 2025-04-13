import useAxiosSecure from "../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import { getTimeAgo } from "../utils/utils";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useState } from "react";

const CommentList = ({
  comment,
  post_id,
  handleDeleteComment,
  userData,
  handleEditComment,
}) => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const { _id, comment: comment_text, commentedAt, editedAt } = comment;
  const [isEditing, setIsEditing] = useState(false);
  const [editedComment, setEditedComment] = useState(comment_text);

  const { data: currentUser = {}, isLoading } = useQuery({
    queryKey: ["user", user?.email],
    queryFn: async () => {
      const { data } = await axiosSecure.get(`/user/${user?.email}`);
      return data;
    },
  });

  if (!userData && isLoading) {
    return (
      <div className="flex gap-2 mt-3">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
        <div className="bg-gray-100 p-2 rounded-lg w-1/2">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 bg-gray-200 rounded mt-1 animate-pulse" />
        </div>
      </div>
    );
  }

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editedComment.trim()) return;
    handleEditComment(post_id, _id, editedComment);
    setIsEditing(false);
  };

  return (
    <div id={`comment-${_id}`} className="flex gap-2 mb-2.5">
      <Link to={`/${userData?.username}`}>
        <img
          src={userData?.profile}
          alt="user"
          className="w-[34px] h-8 object-cover rounded-full"
        />
      </Link>
      <div className="w-full">
        {isEditing ? (
          <form
            onSubmit={handleEditSubmit}
            className="w-full flex gap-3 items-center"
          >
            <input
              type="text"
              value={editedComment}
              onChange={(e) => setEditedComment(e.target.value)}
              className="flex-1 w-full bg-gray-100 py-2.5 px-4 rounded-full text-sm border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button type="submit" className="text-blue-500">
              <i className="fa-solid fa-check text-2xl"></i>
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-red-500"
            >
              <i className="fa-solid fa-times text-[27px]"></i>
            </button>
          </form>
        ) : (
          <>
            <div className="bg-gray-100 py-2 px-3 rounded-lg">
              <Link to={`/${userData?.username}`}>
                <p className="font-semibold">{userData?.name}</p>
              </Link>
              <p className="text-gray-600 text-sm">{comment_text}</p>
            </div>
            <div className="flex items-center gap-5">
              <p className="text-xs">{getTimeAgo(commentedAt)}</p>
              {/* like */}
              <button>
                <i className="fa-solid fa-thumbs-up text-lg"></i>
              </button>
              {/* edit */}
              {userData?._id === currentUser?._id && (
                <button onClick={() => setIsEditing(true)}>
                  <i className="fa-solid fa-pen-to-square text-sm"></i>
                </button>
              )}
              {/* delete */}
              {userData?._id === currentUser?._id && (
                <button onClick={() => handleDeleteComment(post_id, _id)}>
                  <i className="fa-solid fa-trash text-sm" />
                </button>
              )}
              {editedAt && (
                <p className="text-xs text-gray-500">
                  Edited {getTimeAgo(editedAt)}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CommentList;
