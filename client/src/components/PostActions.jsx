const PostActions = ({ post, isLiked, onLike, onComment, onDeletePost }) => {
  return (
    <div className="flex justify-between items-center mt-2">
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <button onClick={() => onLike(post._id)}>
            <i
              className={`fa-solid fa-thumbs-up text-4xl ${
                isLiked ? "text-blue-500" : "text-gray-500"
              }`}
            ></i>
          </button>
          <span className="text-3xl">{post?.liked_by?.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onComment}>
            <i className="fa-solid fa-comment text-4xl"></i>
          </button>
          <span className="text-3xl">{post?.comments?.length}</span>
        </div>
        <button>
          <i className="fa-solid fa-share-nodes text-4xl"></i>
        </button>
        {onDeletePost && (
          <button onClick={() => onDeletePost(post._id)}>
            <i className="fa-solid fa-trash text-4xl"></i>
          </button>
        )}
      </div>
      {post?.postStatus && (
        <i
          onClick={() => document.getElementById("postStatusModal").showModal()}
          className="fa-solid fa-triangle-exclamation text-4xl text-red-500"
        ></i>
      )}
    </div>
  );
};

export default PostActions;
