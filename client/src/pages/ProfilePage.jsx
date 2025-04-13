import AddFriendButton from "../components/buttons/AddFriendButton";
import FollowButton from "../components/buttons/FollowButton";
import ProfileHeader from "../components/ProfileHeader";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import usePostActions from "../utils/usePostActions";
import PostCard from "../components/PostCard";
import FriendLists from "../components/shared/FriendLists";

const ProfilePage = () => {
  const { user: currentUser } = useAuth();
  const axiosSecure = useAxiosSecure();
  const { username } = useParams();

  const {
    data = {},
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["approved-posts", username, currentUser?.email],
    queryFn: () =>
      axiosSecure
        .get(`/approved-posts/${username}`, {
          params: { currentUserEmail: currentUser?.email },
        })
        .then((res) => res.data),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  const { userData, currentUserData, posts } = data;

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
    enabled: !!uniqueUserIds?.length && !isLoading,
    staleTime: 10 * 60 * 1000,
  });

  const actions = usePostActions(
    ["approved-posts", username, currentUser?.email],
    currentUserData?._id
  );

  if (isLoading) {
    return (
      <div className="my-10 text-center">
        <span className="loading loading-bars loading-lg"></span>
      </div>
    );
  }

  const queryKey = ["approved-posts", username, currentUser?.email];

  return (
    <div>
      <ProfileHeader userData={userData} currentUser={currentUserData} />
      <div className="mx-5 md:mx-0 flex gap-3 mt-36">
        <AddFriendButton
          targetUserId={userData?._id}
          currentUserData={currentUserData}
          queryKey={queryKey}
        />
        <FollowButton
          targetUserId={userData?._id}
          currentUserData={currentUserData}
          queryKey={queryKey}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-9 gap-10 mt-5">
        <div className="col-span-9 md:col-span-4">
          <FriendLists friendsData={userData?.friendsData}></FriendLists>
        </div>
        <div className="col-span-9 md:col-span-5">
          {posts?.length > 0 ? (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                userData={userData}
                currentUser={currentUserData}
                onLike={actions.handleLike}
                onComment={actions.handleComment}
                onDeleteComment={actions.handleDeleteComment}
                onEditComment={actions.handleEditComment}
                commentUsers={commentUsers}
                usersLoading={usersLoading}
                onEditSuccess={refetch}
              />
            ))
          ) : (
            <p className="text-center text-gray-500">No approved posts yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
