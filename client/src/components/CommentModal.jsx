import CommentList from "../components/CommentList";
import { getTimeAgo } from "../utils/utils";

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
}) => {
  return (
    <dialog id={`modal-${post._id}`} className="modal">
      <div className="relative modal-box w-11/12 max-w-4xl flex flex-col h-[80vh]">
        <div className="bg-white sticky top-0 z-10 px-3 pt-3 pb-5 flex justify-between items-center border-b">
          <h3 className="font-bold text-lg">{userData?.name}'s Post</h3>
          <button
            className="text-3xl"
            onClick={() => document.getElementById(`modal-${post._id}`).close()}
          >
            <i className="fa-solid fa-circle-xmark"></i>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3">
          <div className="flex items-center gap-3 my-3">
            <img
              src={userData?.image}
              alt="profile"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h1 className="font-semibold">{userData?.name}</h1>
              <p className="text-gray-500 text-sm">
                {getTimeAgo(post?.posted_at)}
              </p>
            </div>
          </div>
          {post?.caption && <p className="my-2">{post?.caption}</p>}
          {post?.image && (
            <img
              src={post?.image}
              alt="post"
              className="w-full h-96 rounded-lg border"
            />
          )}
          <div className="overflow-y-auto max-h-[400px] mb-3">
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
                />
              ))
            )}
          </div>
        </div>
        <div className="bg-white sticky bottom-0 z-10 p-3 flex items-center gap-2 border-t">
          <img
            className="w-10 h-10 object-cover rounded-full"
            src={currentUser?.photoURL}
            alt="profile"
          />
          <input
            type="text"
            placeholder="Write a comment..."
            className="border p-2 w-full rounded-md"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button onClick={onComment}>
            <i className="fa-solid fa-paper-plane text-2xl"></i>
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default CommentModal;
