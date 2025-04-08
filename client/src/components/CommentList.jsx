import { useState } from "react";
import { getTimeAgo } from "../utils/utils";

const CommentList = ({
  comment,
  post_id,
  handleDeleteComment,
  userData,
  handleEditComment,
}) => {
  const { _id, comment: comment_text, commentedAt } = comment;
  const [isEditing, setIsEditing] = useState(false);
  const [editedComment, setEditedComment] = useState(comment_text);

  if (!userData) {
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
      <img
        src={userData?.profile}
        alt="user"
        className="w-8 h-8 object-cover rounded-full"
      />
      <div>
        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="w-full flex gap-2">
            <input
              type="text"
              value={editedComment}
              onChange={(e) => setEditedComment(e.target.value)}
              className="bg-gray-100 py-2.5 px-4 rounded-full text-sm border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="text-blue-500">
              <i className="fa-solid fa-check text-xl"></i>
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-red-500"
            >
              <i className="fa-solid fa-times text-xl"></i>
            </button>
          </form>
        ) : (
          <>
            <div className="bg-gray-100 py-2 px-3 rounded-lg">
              <p className="font-semibold">{userData.name}</p>
              <p className="text-gray-600 text-sm">{comment_text}</p>
            </div>
            <div className="flex items-center gap-5">
              <p className="text-xs">{getTimeAgo(commentedAt)}</p>
              {/* like */}
              <button>
                <i className="fa-solid fa-thumbs-up text-lg"></i>
              </button>
              {/* edit */}
              {userData._id === comment.user_id && (
                <button onClick={() => setIsEditing(true)}>
                  <i className="fa-solid fa-pen-to-square text-sm"></i>
                </button>
              )}
              {/* delete */}
              {userData._id === comment.user_id && (
                <button onClick={() => handleDeleteComment(post_id, _id)}>
                  <i className="fa-solid fa-trash text-sm" />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CommentList;
