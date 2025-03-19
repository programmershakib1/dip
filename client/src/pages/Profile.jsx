import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import FriendRequestList from "../components/FriendRequestList";
import { getTimeAgo, imageUpload } from "../utils/utils";
import useAxiosSecure from "./../hooks/useAxiosSecure";
import CommentList from "../components/CommentList";
import { useForm } from "react-hook-form";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";
import { useState } from "react";
import Swal from "sweetalert2";

const Profile = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  // get my data
  const {
    data: data = {},
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["my-data", user?.email],
    queryFn: async () => {
      const { data } = await axiosSecure.get(`/my-data/${user?.email}`);
      return data;
    },
  });

  const { user_data, posts } = data;

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

  // create post form submit
  const onSubmit = async (data) => {
    setLoading(true);
    const { caption, image_file } = data;

    // form value check
    if (!caption.trim() && !image_file?.[0]) {
      setLoading(false);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Caption or Image is required",
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    // post image upload
    const file = image_file ? image_file[0] : null;
    let image = null;
    if (file) image = await imageUpload(file);

    // post info
    const postInfo = {
      caption,
      image,
      posted_at: new Date().toISOString(),
      liked_by: [],
      comments: [],
      user_id: user_data?._id,
      approved_status: false,
    };

    // post
    await axiosSecure.post("/new-post", postInfo).then((res) => {
      if (res.data.insertedId) {
        setLoading(false);
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Posting successful. Wait for approval.",
          showConfirmButton: false,
          timer: 1500,
        });
        reset();
        refetch();
      }
    });
  };

  // handle like
  const likeMutation = useMutation({
    mutationFn: (postId) =>
      axiosSecure.post(`/like-post/${postId}`, { user_email: user?.email }),
    onMutate: async (postId) => {
      await queryClient.cancelQueries(["my-data", user?.email]);
      const previousData = queryClient.getQueryData(["my-data", user?.email]);

      queryClient.setQueryData(["my-data", user?.email], (old) => {
        const updatedPosts = old.posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                liked_by: post.liked_by.includes(user?.email)
                  ? post.liked_by.filter((email) => email !== user?.email)
                  : [...post.liked_by, user?.email],
              }
            : post
        );
        return { ...old, posts: updatedPosts };
      });

      return { previousData };
    },
    onError: (err, postId, context) => {
      queryClient.setQueryData(["my-data", user?.email], context.previousData);
      toast.error("Failed to like post!");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["my-data", user?.email]);
    },
  });

  // handle comment
  const commentMutation = useMutation({
    mutationFn: ({ postId, comment }) =>
      axiosSecure.post(`/add-comment/${postId}`, {
        user_id: user_data?._id,
        comment,
      }),
    onMutate: async ({ postId, comment }) => {
      await queryClient.cancelQueries(["my-data", user?.email]);
      const previousData = queryClient.getQueryData(["my-data", user?.email]);

      const newCommentId = new Date().toISOString();
      queryClient.setQueryData(["my-data", user?.email], (old) => {
        const updatedPosts = old.posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: [
                  ...post.comments,
                  {
                    _id: newCommentId,
                    user_id: user_data?._id,
                    comment,
                    commented_at: new Date().toISOString(),
                  },
                ],
              }
            : post
        );
        return { ...old, posts: updatedPosts };
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
      queryClient.setQueryData(["my-data", user?.email], context.previousData);
      toast.error("Failed to add comment!");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["my-data", user?.email]);
    },
  });

  // handle delete comment
  const deleteCommentMutation = useMutation({
    mutationFn: ({ postId, commentId }) =>
      axiosSecure.delete(`/delete-comment/${postId}/${commentId}`),
    onMutate: async ({ postId, commentId }) => {
      await queryClient.cancelQueries(["my-data", user?.email]);
      const previousData = queryClient.getQueryData(["my-data", user?.email]);

      queryClient.setQueryData(["my-data", user?.email], (old) => {
        const updatedPosts = old.posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: post.comments.filter(
                  (comment) => comment._id !== commentId
                ),
              }
            : post
        );
        return { ...old, posts: updatedPosts };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["my-data", user?.email], context.previousData);
      toast.error("Failed to delete comment!");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["my-data", user?.email]);
    },
  });

  // post delete
  const handleDeletePost = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosSecure.delete(`/my-post-delete/${id}`).then((res) => {
          if (res.data.deletedCount > 0) {
            Swal.fire("Deleted!", "Your post has been deleted.", "success");
            refetch();
          }
        });
      }
    });
  };

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
    <div>
      {/* profile start */}
      <div className="relative">
        <img
          className="w-full md:h-96 lg:h-[450px] object-cover rounded-xl"
          src={user_data?.banner}
          alt="banner"
        />
        <div className="absolute -bottom-28 left-5 flex items-center gap-5">
          <img
            className="w-40 h-40 object-cover border-4 rounded-full"
            src={user?.photoURL}
            alt="profile"
          />
          <div className="mt-3">
            <h2 className="text-xl font-semibold">{user?.displayName}</h2>
            <p>{user_data?.friends?.length || 0} friends</p>
          </div>
        </div>
      </div>
      {/* profile end */}
      <div className="grid lg:grid-cols-9 gap-10 mt-28">
        <div className="col-span-4">
          <div className="mt-5">
            {user_data?.pendingRequests?.map((request, idx) => (
              <FriendRequestList
                key={idx}
                request={request}
                refetchUserData={refetch}
                current_id={user_data?._id}
              ></FriendRequestList>
            ))}
          </div>
        </div>
        <div className="col-span-5">
          {/* post create form start */}
          <form onSubmit={handleSubmit(onSubmit)} className="my-5">
            <div className="flex gap-2">
              <img
                className="w-14 h-14 object-cover rounded-full"
                src={user?.photoURL}
                alt="profile"
              />
              <textarea
                placeholder="What's on your mind?"
                className="mt-2 w-full h-40 border border-black p-3 rounded-xl"
                {...register("caption")}
              ></textarea>
            </div>
            <div className="flex items-center justify-between mt-5">
              <input
                type="file"
                accept="image/*"
                className="pl-16"
                {...register("image_file")}
              />
              <button className="w-24 bg-black text-white py-2 px-2 font-bold rounded-md">
                {loading ? (
                  <div className="flex justify-center items-center">
                    <span className="loading loading-spinner text-white"></span>
                  </div>
                ) : (
                  "Post"
                )}
              </button>
            </div>
          </form>
          {/* post create form end */}
          {/* my posts start */}
          {posts.map((post, idx) => {
            const isLiked = post?.liked_by?.includes(user?.email);
            return (
              <div
                key={idx}
                className="p-5 border border-black rounded-xl mb-5"
              >
                {/* user info */}
                <div className="flex items-center gap-3">
                  <img
                    src={user_data?.image}
                    alt="profile"
                    className="w-10 h-10 object-cover rounded-full"
                  />
                  <div>
                    <h1 className="font-semibold">{user_data?.name}</h1>
                    <p className="text-gray-500 text-sm">
                      {getTimeAgo(post?.posted_at)}
                    </p>
                  </div>
                </div>
                {/* post info */}
                {post?.caption && <p className="mt-3">{post?.caption}</p>}
                {post?.image && (
                  <img
                    src={post?.image}
                    alt="post"
                    className="w-full h-96 mt-3"
                  />
                )}
                {/* action button */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-5">
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
                          document
                            .getElementById(`modal-${post?._id}`)
                            .showModal();
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
                    {/* delete */}
                    <button onClick={() => handleDeletePost(post?._id)}>
                      <i className="fa-solid fa-trash text-3xl"></i>
                    </button>
                  </div>
                  {/* post status */}
                  {post?.post_status && (
                    <i
                      onClick={() =>
                        document.getElementById("my_modal_5").showModal()
                      }
                      className="fa-solid fa-triangle-exclamation text-4xl text-red-500"
                    ></i>
                  )}
                </div>
                {/* comment modal */}
                <dialog id={`modal-${post?._id}`} className="modal">
                  <div className="relative modal-box w-11/12 max-w-4xl flex flex-col h-[80vh]">
                    <div className="bg-white sticky top-0 z-10 px-3 pt-3 pb-5 flex justify-between items-center border-b">
                      <h3 className="font-bold text-lg">
                        {user_data?.name}'s Post
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
                          src={user_data?.image}
                          alt="profile"
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <h1 className="font-semibold">{user_data?.name}</h1>
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
                {/* post status, reject warning modal */}
                <dialog
                  id="my_modal_5"
                  className="modal modal-bottom sm:modal-middle"
                >
                  <div className="modal-box">
                    {post?.post_status ? post.post_status : "Not Found"}
                    <div className="modal-action">
                      <form method="dialog">
                        <button className="btn">Close</button>
                      </form>
                    </div>
                  </div>
                </dialog>
              </div>
            );
          })}
          {/* my post end */}
        </div>
      </div>
    </div>
  );
};

export default Profile;
