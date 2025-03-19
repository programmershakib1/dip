import { getTimeAgo } from "../utils/utils";

const CommentList = ({ comment, post_id, handleDeleteComment, userData }) => {
  const { _id, comment: comment_text, commented_at } = comment;

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

  return (
    <div id={`comment-${_id}`} className="flex gap-2 mt-3">
      <img
        src={userData.image}
        alt="user"
        className="w-8 h-8 object-cover rounded-full"
      />
      <div className="bg-gray-100 p-2 rounded-lg">
        <div className="flex items-center gap-2">
          <p className="font-semibold">{userData.name}</p>
          <button onClick={() => handleDeleteComment(post_id, _id)}>
            <i className="fa-solid fa-trash text-red-500" />
          </button>
        </div>
        <p className="text-gray-600 text-sm">{comment_text}</p>
        <p className="text-xs text-gray-400">{getTimeAgo(commented_at)}</p>
      </div>
    </div>
  );
};

export default CommentList;
