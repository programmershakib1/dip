import { getTimeAgo } from "../utils/utils";
import CommentModal from "./CommentModal";
import { Link } from "react-router-dom";
import PostActions from "./PostActions";
import { useState } from "react";

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
  const isLiked = post?.liked_by?.includes(userData?._id);
  const [expandedCaption, setExpandedCaption] = useState(false);
  const [commentText, setCommentText] = useState("");

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;
    onComment(post._id, commentText);
    setCommentText("");
  };

  return (
    <div className="p-5 border border-black rounded-xl mb-5">
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
            <h1 className="font-semibold">{userData?.name}</h1>
          </Link>
          <p className="text-gray-500 text-sm">{getTimeAgo(post?.postedAt)}</p>
        </div>
      </div>
      {post?.caption && (
        <div className="mt-3">
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
          className="mt-3 w-full h-96 rounded-lg"
        />
      )}
      <PostActions
        post={post}
        isLiked={isLiked}
        onLike={onLike}
        onComment={() =>
          document.getElementById(`modal-${post._id}`).showModal()
        }
        onDeletePost={onDeletePost}
        userData={userData}
        onEditSuccess={onEditSuccess}
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
    </div>
  );
};

export default PostCard;
