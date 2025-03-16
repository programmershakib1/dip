import useAxiosSecure from "../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import useAuth from "../hooks/useAuth";
import { useState } from "react";
import useAxiosPublic from "../hooks/useAxiosPublic";

const NewsFeed = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const axiosPublic = useAxiosPublic();
  const [commentText, setCommentText] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);

  // get news feed posts
  const {
    data: posts = [],
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["news-feeds"],
    queryFn: async () => {
      const { data } = await axiosPublic.get("/news-feeds");
      return data;
    },
  });

  // handle like
  const handleLike = (id) => {
    axiosSecure
      .post(`/like-post/${id}`, { user_email: user?.email })
      .then(() => {
        refetch();
      });
  };

  // handle comment
  const handleComment = async () => {
    if (!commentText.trim()) return;

    await axiosSecure.post(`/add-comment/${selectedPost}`, {
      user_name: user?.displayName,
      user_email: user?.email,
      user_image: user?.photoURL,
      comment: commentText,
    });
    setCommentText("");
    refetch();
  };

  // handle delete comment
  const handleDeleteComment = async (postId, commentId) => {
    try {
      await axiosSecure.delete(`/delete-comment/${postId}/${commentId}`);
      refetch();
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  // handle time
  const getTimeAgo = (dateString) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  if (isLoading)
    return (
      <div className="my-10 text-center">
        <span className="loading loading-bars loading-lg"></span>
      </div>
    );
  return (
    <div className="grid lg:grid-cols-9">
      <div className="col-span-2"></div>
      <div className="col-span-5">
        {posts.map((post, idx) => {
          const isLiked = post?.liked_by?.includes(user?.email);
          return (
            <div key={idx} className="p-5 border border-black rounded-xl mb-5">
              <div className="flex items-center">
                <img
                  src={post?.user_image}
                  alt="user"
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <h1 className="font-semibold">{post?.user_name}</h1>
                  <p className="text-gray-500 text-sm">
                    {getTimeAgo(post?.posted_at)}
                  </p>
                </div>
              </div>
              <p className="mt-3">{post?.caption}</p>
              {post?.image && (
                <img
                  src={post?.image}
                  alt="post"
                  className="w-full h-96 mt-3"
                />
              )}
              {/* action button */}
              <div className="flex items-center gap-5 mt-3">
                {/* like */}
                <div className="flex items-center gap-2">
                  <button onClick={() => handleLike(post?._id)}>
                    <i
                      className={`fa-solid fa-thumbs-up text-4xl ${
                        isLiked ? "text-blue-500" : "text-gray-500"
                      }`}
                    ></i>
                  </button>
                  <span className="text-3xl">{post?.liked_by?.length}</span>
                </div>
                {/* comment */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedPost(post?._id);
                      document.getElementById(`modal-${post._id}`).showModal();
                    }}
                  >
                    <i className="fa-solid fa-comment text-4xl"></i>
                  </button>
                  <span className="text-3xl">{post?.comments?.length}</span>
                </div>
                {/* share */}
                <button>
                  <i className="fa-solid fa-share-nodes text-4xl"></i>
                </button>
              </div>

              {/* comment modal */}
              <dialog id={`modal-${post._id}`} className="modal">
                <div className="relative modal-box w-11/12 max-w-4xl flex flex-col h-[80vh]">
                  <div className="bg-white sticky top-0 z-10 px-3 pt-3 pb-5 flex justify-between items-center border-b">
                    <h3 className="font-bold text-lg">
                      {post?.user_name}'s Post
                    </h3>
                    <button
                      className="text-3xl"
                      onClick={() =>
                        document.getElementById(`modal-${post._id}`).close()
                      }
                    >
                      <i className="fa-solid fa-circle-xmark"></i>
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto px-3">
                    <div className="flex items-center my-3">
                      <img
                        src={post?.user_image}
                        alt="user"
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <h1 className="font-semibold">{post?.user_name}</h1>
                        <p className="text-gray-500 text-sm">
                          {getTimeAgo(post?.posted_at)}
                        </p>
                      </div>
                    </div>
                    <p className="my-2">{post?.caption}</p>
                    {post?.image && (
                      <img
                        src={post?.image}
                        alt="Post"
                        className="w-full h-96 rounded-lg border"
                      />
                    )}
                    {/* comments list */}
                    <div className="overflow-y-auto max-h-[400px] my-1">
                      {post?.comments?.map((c, idx) => (
                        <div key={idx} className="flex gap-2 my-2">
                          <img
                            src={c.user_image}
                            alt="user"
                            className="w-8 h-8 object-cover rounded-full"
                          />
                          <div className="bg-gray-100 p-2 rounded-lg">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{c.user_name}</p>
                              {/* comment delete button */}
                              <button
                                onClick={() =>
                                  handleDeleteComment(post._id, c._id)
                                }
                              >
                                <i className="fa-solid fa-trash text-red-500"></i>
                              </button>
                            </div>
                            <p className="text-gray-600 text-sm">{c.comment}</p>
                            <p className="text-xs text-gray-400">
                              {formatDistanceToNow(new Date(c.commented_at), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* comment input */}
                  <div className="sticky bottom-0 bg-white z-10 p-3 border-t flex items-center gap-2">
                    <img
                      className="w-10 h-10 object-cover rounded-full"
                      src={user?.photoURL}
                      alt="User"
                    />
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      className="border p-2 w-full rounded-md"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                    <button onClick={handleComment}>
                      <i className="fa-solid fa-paper-plane text-2xl"></i>
                    </button>
                  </div>
                </div>
              </dialog>
            </div>
          );
        })}
      </div>
      <div className="col-span-2"></div>
    </div>
  );
};

export default NewsFeed;
