import usePostActions from "../utils/usePostActions";
import useAxiosPublic from "../hooks/useAxiosPublic";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import PostCard from "../components/PostCard";
import useAuth from "../hooks/useAuth";

const NewsFeed = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const axiosPublic = useAxiosPublic();

  const { data: posts = [], isLoading } = useQuery({
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

  const uniqueUserIds = [
    ...new Set(posts?.flatMap((post) => post.comments?.map((c) => c.user_id))),
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

  const actions = usePostActions(["news-feeds"], current_user?._id);

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
        {posts.map((post, idx) => (
          <PostCard
            key={idx}
            post={post}
            userData={post.userData}
            currentUser={current_user}
            onLike={actions.handleLike}
            onComment={actions.handleComment}
            onDeleteComment={actions.handleDeleteComment}
            commentUsers={commentUsers}
            usersLoading={usersLoading}
            onEditComment={actions.handleEditComment}
          />
        ))}
      </div>
      <div className="col-span-2"></div>
    </div>
  );
};

export default NewsFeed;
