import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../hooks/useAxiosSecure";
import useAxiosPublic from "../hooks/useAxiosPublic";
import CommentList from "../components/CommentList";
import { getTimeAgo } from "../utils/utils";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";
import { useState } from "react";

const NewsFeed = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const axiosPublic = useAxiosPublic();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);

  // get news feed posts
  const {
    data: posts = [],
    // refetch,
    isLoading,
  } = useQuery({
    queryKey: ["news-feeds"],
    queryFn: async () => {
      const { data } = await axiosPublic.get("/news-feeds");
      return data;
    },
  });

  const { data: current_user = {} } = useQuery({
    queryKey: ["current_user", user?.email],
    queryFn: async () => {
      const { data } = await axiosPublic.get(`/user/${user?.email}`);
      return data;
    },
  });

  // fetch all unique user data for comments
  const uniqueUserIds = [
    ...new Set(posts?.flatMap((post) => post.comments.map((c) => c.user_id))),
  ];

  const { data: commentUsers = {}, isLoading: usersLoading } = useQuery({
    queryKey: ["comment-users", uniqueUserIds],
    queryFn: async () => {
      const response = await axiosSecure.post("/users-by-ids", {
        userIds: uniqueUserIds,
      });
      return response.data.reduce((acc, user) => {
        acc[user._id] = user;
        return acc;
      }, {});
    },
    enabled: !!uniqueUserIds.length && !isLoading,
  });

  // Handle like
  const likeMutation = useMutation({
    mutationFn: (postId) =>
      axiosSecure.post(`/like-post/${postId}`, { user_email: user?.email }),
    onMutate: async (postId) => {
      await queryClient.cancelQueries(["news-feeds"]);
      const previousData = queryClient.getQueryData(["news-feeds"]);

      queryClient.setQueryData(["news-feeds"], (old) => {
        const updatedPosts = old.map((post) =>
          post._id === postId
            ? {
                ...post,
                liked_by: post.liked_by.includes(user?.email)
                  ? post.liked_by.filter((email) => email !== user?.email)
                  : [...post.liked_by, user?.email],
              }
            : post
        );
        return updatedPosts;
      });

      return { previousData };
    },
    onError: (err, postId, context) => {
      queryClient.setQueryData(["news-feeds"], context.previousData);
      toast.error("Failed to like post!");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["news-feeds"]);
    },
  });

  // Handle comment
  const commentMutation = useMutation({
    mutationFn: ({ postId, comment }) =>
      axiosSecure.post(`/add-comment/${postId}`, {
        user_id: current_user?._id,
        comment,
      }),
    onMutate: async ({ postId, comment }) => {
      await queryClient.cancelQueries(["news-feeds"]);
      const previousData = queryClient.getQueryData(["news-feeds"]);

      const newCommentId = new Date().toISOString();
      queryClient.setQueryData(["news-feeds"], (old) => {
        const updatedPosts = old.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: [
                  ...post.comments,
                  {
                    _id: newCommentId,
                    user_id: current_user?._id,
                    comment,
                    commented_at: new Date().toISOString(),
                  },
                ],
              }
            : post
        );
        return updatedPosts;
      });

      setCommentText("");
      return { previousData, newCommentId, postId };
    },
    onSuccess: (data, variables, context) => {
      setTimeout(() => {
        const commentElement = document.getElementById(
          `comment-${context.newCommentId}`
        );
        if (commentElement) {
          commentElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["news-feeds"], context.previousData);
      toast.error("Failed to add comment!");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["news-feeds"]);
    },
  });

  // Handle delete comment
  const deleteCommentMutation = useMutation({
    mutationFn: ({ postId, commentId }) =>
      axiosSecure.delete(`/delete-comment/${postId}/${commentId}`),
    onMutate: async ({ postId, commentId }) => {
      await queryClient.cancelQueries(["news-feeds"]);
      const previousData = queryClient.getQueryData(["news-feeds"]);

      queryClient.setQueryData(["news-feeds"], (old) => {
        const updatedPosts = old.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: post.comments.filter(
                  (comment) => comment._id !== commentId
                ),
              }
            : post
        );
        return updatedPosts;
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["news-feeds"], context.previousData);
      toast.error("Failed to delete comment!");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["news-feeds"]);
    },
  });

  const handleLike = (postId) => likeMutation.mutate(postId);
  const handleComment = () => {
    if (!commentText.trim()) return;
    commentMutation.mutate({ postId: selectedPost, comment: commentText });
  };
  const handleDeleteComment = (postId, commentId) =>
    deleteCommentMutation.mutate({ postId, commentId });

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
                <Link to={post?.user_data?.username}>
                  <img
                    src={post?.user_data?.image}
                    alt="profile"
                    className="w-10 h-10 object-cover rounded-full mr-3"
                  />
                </Link>
                <div>
                  <Link to={post?.user_data?.username}>
                    <h1 className="font-semibold">{post?.user_data?.name}</h1>
                  </Link>
                  <p className="text-gray-500 text-sm">
                    {getTimeAgo(post?.posted_at)}
                  </p>
                </div>
              </div>
              {post?.caption && <p className="mt-3">{post?.caption}</p>}
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
                  <button
                    onClick={() => handleLike(post?._id)}
                    disabled={likeMutation.isLoading}
                  >
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
                      document.getElementById(`modal-${post?._id}`).showModal();
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
              <dialog id={`modal-${post?._id}`} className="modal">
                <div className="relative modal-box w-11/12 max-w-4xl flex flex-col h-[80vh]">
                  <div className="bg-white sticky top-0 z-10 px-3 pt-3 pb-5 flex justify-between items-center border-b">
                    <h3 className="font-bold text-lg">
                      {post?.user_data?.name}'s Post
                    </h3>
                    <button
                      className="text-3xl"
                      onClick={() =>
                        document.getElementById(`modal-${post?._id}`).close()
                      }
                    >
                      <i className="fa-solid fa-circle-xmark"></i>
                    </button>
                  </div>
                  {/* post info */}
                  <div className="flex-1 overflow-y-auto px-3">
                    <div className="flex items-center gap-3 my-3">
                      <img
                        src={post?.user_data?.image}
                        alt="profile"
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <h1 className="font-semibold">
                          {post?.user_data?.name}
                        </h1>
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
                    {/* comments list */}
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
                            handleDeleteComment={handleDeleteComment}
                            userData={commentUsers[comment.user_id]}
                          />
                        ))
                      )}
                    </div>
                  </div>
                  {/* comment input */}
                  <div className="bg-white sticky bottom-0 z-10 p-3 flex items-center gap-2 border-t ">
                    <img
                      className="w-10 h-10 object-cover rounded-full"
                      src={user?.photoURL}
                      alt="profile"
                    />
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      className="border p-2 w-full rounded-md"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                    <button
                      onClick={handleComment}
                      disabled={commentMutation.isLoading}
                    >
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
