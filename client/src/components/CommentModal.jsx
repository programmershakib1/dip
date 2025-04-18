import CommentList from "../components/CommentList";
import { getTimeAgo } from "../utils/utils";
import { useState } from "react";

const CommentModal = ({
  post,
  userData,
  currentUser,
  commentText,
  setCommentText,
  onComment,
  commentUsers,
  usersLoading,
  onDeleteComment,
  onEditComment,
}) => {
  const [expandedCaption, setExpandedCaption] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);

  const toggleFullScreen = () => {
    setShowFullScreen(!showFullScreen);
  };

  return (
    <dialog id={`modal-${post._id}`} className="modal">
      <div className="relative modal-box w-full h-full md:w-11/12 md:max-w-4xl flex flex-col md:h-[80vh] rounded-none md:rounded-lg">
        <div className="bg-white sticky top-0 z-10 pb-2 md:pb-4 flex justify-between items-center border-b">
          <h3 className="font-bold text-lg">{userData?.name}'s Post</h3>
          <button
            className="text-3xl"
            onClick={() => document.getElementById(`modal-${post._id}`).close()}
          >
            <i className="fa-solid fa-circle-xmark"></i>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center gap-3 my-3">
            <img
              src={userData?.profile}
              alt="profile"
              className="w-11 h-11 object-cover rounded-full"
            />
            <div>
              <h1 className="font-semibold">{userData?.name}</h1>
              <p className="text-gray-500 text-sm">
                {getTimeAgo(post?.postedAt)}
              </p>
            </div>
          </div>
          {post?.caption && (
            <div className="mb-5">
              {expandedCaption || post.caption.length <= 200 ? (
                <p>{post.caption}</p>
              ) : (
                <>
                  <p>
                    {post.caption.slice(0, 200)}...
                    <button
                      className="text-gray-500 hover:underline ml-1"
                      onClick={() => setExpandedCaption(true)}
                    >
                      See more
                    </button>
                  </p>
                </>
              )}
              {expandedCaption && post.caption.length > 200 && (
                <button
                  className="text-gray-500 hover:underline mt-1"
                  onClick={() => setExpandedCaption(false)}
                >
                  See less
                </button>
              )}
            </div>
          )}
          {post?.image && (
            <img
              src={post?.image}
              alt="post"
              onClick={toggleFullScreen}
              className="mt-3 w-full max-h-96 md:max-h-[500px] object-cover rounded-lg cursor-pointer"
            />
          )}
          <div className="overflow-y-auto max-h-[400px] mt-5 mb-3">
            {usersLoading ? (
              <div className="text-center">
                <span className="loading loading-spinner" />
              </div>
            ) : (
              post?.comments?.map((comment, idx) => (
                <CommentList
                  key={idx}
                  comment={comment}
                  post_id={post?._id}
                  handleDeleteComment={onDeleteComment}
                  userData={commentUsers[comment.user_id]}
                  handleEditComment={onEditComment}
                />
              ))
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white sticky bottom-0 z-10 pt-4">
          <img
            className="w-10 h-10 object-cover rounded-full"
            src={currentUser?.profile}
            alt="profile"
          />
          <input
            type="text"
            placeholder="Write a comment..."
            className="flex-1 bg-gray-100 py-2.5 px-4 rounded-full text-sm border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && onComment()}
          />
          <button
            onClick={onComment}
            className="text-blue-500 hover:text-blue-700"
          >
            <i className="fa-solid fa-paper-plane text-2xl"></i>
          </button>
        </div>
      </div>
      {/* Full screen image modal */}
      {showFullScreen && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          <div className="relative max-w-full max-h-full">
            <img
              src={post?.image}
              alt="full-screen-post"
              className="max-w-full max-h-full md:max-w-[90vw] md:max-h-[90vh]"
            />
            <button
              onClick={toggleFullScreen}
              className="absolute top-4 right-4 text-white text-4xl"
            >
              <i className="fa-solid fa-circle-xmark"></i>
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
};

export default CommentModal;
