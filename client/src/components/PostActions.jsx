import { useLocation } from "react-router-dom";
import PostEditForm from "./PostEditForm";

const PostActions = ({
  post,
  isLiked,
  onLike,
  onComment,
  onDeletePost,
  userData,
  onEditSuccess,
}) => {
  const { pathname } = useLocation();

  return (
    <div className="flex justify-between items-center mt-2">
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          {/* like button */}
          <button onClick={() => onLike(post._id)}>
            <i
              className={`fa-solid fa-thumbs-up text-3xl ${
                isLiked ? "text-blue-500" : "text-gray-500"
              }`}
            ></i>
          </button>
          <span className="text-3xl">{post?.liked_by?.length}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* comment button */}
          <button onClick={onComment}>
            <i className="fa-solid fa-comment text-3xl"></i>
          </button>
          <span className="text-3xl">{post?.comments?.length}</span>
        </div>
        {/* share button */}
        <button>
          <i className="fa-solid fa-share-nodes text-3xl"></i>
        </button>
        {onDeletePost && (
          // delete button
          <button onClick={() => onDeletePost(post._id)}>
            <i className="fa-solid fa-trash text-[27px]"></i>
          </button>
        )}
      </div>
      <div className="flex items-center gap-5">
        {/* edit button */}
        {pathname === "/profile" && (
          <PostEditForm
            post={post}
            userData={userData}
            onEditSuccess={onEditSuccess}
          />
        )}
        {post?.postStatus && (
          <i
            onClick={() =>
              document.getElementById("postStatusModal").showModal()
            }
            className="fa-solid fa-triangle-exclamation text-[26px] text-red-500"
          ></i>
        )}
      </div>
      <dialog
        id="postStatusModal"
        className="modal modal-bottom sm:modal-middle"
      >
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

export default PostActions;
