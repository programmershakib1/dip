import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getTimeAgo } from "../utils/utils";
import CommentModal from "./CommentModal";
import PostEditForm from "./PostEditForm";
import { Link } from "react-router-dom";
import PostActions from "./PostActions";

const PostCard = ({
  post,
  userData,
  currentUser,
  onLike,
  onComment,
  onDeleteComment,
  onDeletePost,
  commentUsers,
  usersLoading,
  onEditSuccess,
  onEditComment,
}) => {
  const isLiked = post?.liked_by?.includes(currentUser?._id);
  const [expandedCaption, setExpandedCaption] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const { pathname } = useLocation();
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;
    onComment(post._id, commentText);
    setCommentText("");
  };

  const toggleFullScreen = () => {
    setShowFullScreen(!showFullScreen);
  };

  return (
    <div className="md:mb-5 md:p-5 border-t-[3px] border-gray-400 md:border md:border-black md:rounded-xl">
      <div className="mt-3 mx-5 md:mx-0 flex justify-between relative">
        <div className="flex items-center">
          <Link to={`/${userData?.username}`}>
            <img
              src={userData?.profile}
              alt="profile"
              className="w-10 h-10 object-cover rounded-full mr-3"
            />
          </Link>
          <div>
            <Link to={`/${userData?.username}`}>
              <h2 className="font-semibold">{userData?.name}</h2>
            </Link>
            <p className="text-gray-500 text-sm">
              {getTimeAgo(post?.postedAt)}
            </p>
          </div>
        </div>
        {/* 3 dot menu and post status */}
        <div className="flex gap-3">
          {post?.postStatus && (
            <i
              onClick={() =>
                document.getElementById("postStatusModal").showModal()
              }
              className="fa-solid fa-triangle-exclamation text-[26px] text-red-500"
            ></i>
          )}
          {currentUser?._id === userData?._id && pathname === "/profile" && (
            <div>
              <button
                ref={buttonRef}
                onClick={() => setShowMenu(!showMenu)}
                className="text-gray-600 hover:text-gray-800"
              >
                <i className="fa-solid fa-ellipsis text-2xl"></i>
              </button>
              {showMenu && (
                <div
                  ref={menuRef}
                  className="w-44 absolute right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-10 py-2 px-4"
                >
                  {pathname === "/profile" && (
                    <div className="mb-1.5">
                      <PostEditForm
                        post={post}
                        userData={userData}
                        onEditSuccess={(updatedPost) => {
                          onEditSuccess(updatedPost);
                          setShowMenu(false);
                        }}
                      />
                    </div>
                  )}
                  {onDeletePost && (
                    <button
                      onClick={() => {
                        onDeletePost(post._id);
                        setShowMenu(false);
                      }}
                      className="text-gray-600"
                    >
                      <i className="fa-solid fa-trash text-lg"></i>
                      <span className="ml-2">Delete</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {post?.caption && (
        <div className="mt-3 mx-5 md:mx-0">
          {expandedCaption || post.caption.length <= 200 ? (
            <p>{post.caption}</p>
          ) : (
            <>
              <p>
                {post.caption.slice(0, 125)}...
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
          className="mt-3 w-full max-h-96 md:max-h-[500px] object-cover md:rounded-lg cursor-pointer"
        />
      )}
      <PostActions
        post={post}
        isLiked={isLiked}
        onLike={onLike}
        onComment={() =>
          document.getElementById(`modal-${post._id}`).showModal()
        }
        currentUser={currentUser}
      />
      <CommentModal
        post={post}
        userData={userData}
        currentUser={currentUser}
        commentText={commentText}
        setCommentText={setCommentText}
        onComment={handleCommentSubmit}
        commentUsers={commentUsers}
        usersLoading={usersLoading}
        onDeleteComment={onDeleteComment}
        onEditComment={onEditComment}
      />
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
      {/* post status modal */}
      <dialog id="postStatusModal" className="modal sm:modal-middle">
        <div className="modal-box">
          <p className="py-4">{post?.postStatus}</p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default PostCard;
