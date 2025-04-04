import ProfileHeader from "../components/ProfileHeader";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import PostForm from "../components/PostForm";
import PostCard from "../components/PostCard";
import useAuth from "../hooks/useAuth";
import Swal from "sweetalert2";
import {
  useCommentMutation,
  useDeleteCommentMutation,
  useLikeMutation,
} from "../utils/usePostMutations";

const Profile = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

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

  const { userData, posts } = data;

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

  const likeMutation = useLikeMutation(["my-data", user?.email], user?.email);
  const commentMutation = useCommentMutation(
    ["my-data", user?.email],
    userData?._id
  );
  const deleteCommentMutation = useDeleteCommentMutation([
    "my-data",
    user?.email,
  ]);

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

  const handleComment = (postId, commentText) => {
    if (!commentText.trim()) return;
    commentMutation.mutate({ postId, comment: commentText });
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
    <div className="mx-5 md:mx-0">
      <ProfileHeader userData={userData} currentUser={user} />
      <div className="grid lg:grid-cols-9 gap-10">
        <div className="col-span-4"></div>
        <div className="col-span-5">
          <PostForm userData={userData} onPostSuccess={refetch} />
          {posts?.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              userData={userData}
              currentUser={user}
              onLike={handleLike}
              onComment={handleComment}
              onDeleteComment={handleDeleteComment}
              onDeletePost={handleDeletePost}
              commentUsers={commentUsers}
              usersLoading={usersLoading}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
