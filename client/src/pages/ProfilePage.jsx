import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { user: currentUser } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const { username } = useParams();

  const { data: current_user = {}, isLoading: currentUserLoading } = useQuery({
    queryKey: ["current_user", currentUser],
    queryFn: () =>
      axiosSecure.get(`/user/${currentUser?.email}`).then((res) => res.data),
  });

  const { data: user = {}, isLoading: targetedUserLoading } = useQuery({
    queryKey: ["user", username],
    queryFn: () =>
      axiosSecure.get(`/username/${username}`).then((res) => res.data),
  });

  // send friend request mutation
  const sendFriendRequestMutation = useMutation({
    mutationFn: () =>
      axiosSecure.put(`/send-friend-request/${user._id}`, {
        current_id: current_user._id,
      }),
    onMutate: async () => {
      await queryClient.cancelQueries();
      const prevCurrent = queryClient.getQueryData([
        "current_user",
        currentUser,
      ]);

      const prevTarget = queryClient.getQueryData(["user", username]);

      queryClient.setQueryData(["current_user", currentUser], (old) => ({
        ...old,
        sentRequests: [...(old?.sentRequests || []), user._id],
      }));

      queryClient.setQueryData(["user", username], (old) => ({
        ...old,
        pendingRequests: [...(old?.pendingRequests || []), current_user._id],
      }));

      toast.success("Friend request sent!");
      return { prevCurrent, prevTarget };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ["current_user", currentUser],
        context.prevCurrent
      );
      queryClient.setQueryData(["user", username], context.prevTarget);
      toast.error("Failed to send friend request!");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["user", username]);
      queryClient.invalidateQueries(["current_user", currentUser]);
    },
  });

  // cancel friend request mutation
  const cancelFriendRequestMutation = useMutation({
    mutationFn: () =>
      axiosSecure.put(`/cancel-friend-request/${user._id}`, {
        current_id: current_user._id,
      }),
    onMutate: async () => {
      await queryClient.cancelQueries();
      const prevCurrent = queryClient.getQueryData([
        "current_user",
        currentUser,
      ]);

      const prevTarget = queryClient.getQueryData(["user", username]);

      queryClient.setQueryData(["current_user", currentUser], (old) => ({
        ...old,
        sentRequests: old?.sentRequests?.filter((id) => id !== user._id) || [],
      }));

      queryClient.setQueryData(["user", username], (old) => ({
        ...old,
        pendingRequests:
          old?.pendingRequests?.filter((id) => id !== current_user._id) || [],
      }));

      toast.success("Friend request cancelled!");
      return { prevCurrent, prevTarget };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ["current_user", currentUser],
        context.prevCurrent
      );
      queryClient.setQueryData(["user", username], context.prevTarget);
      toast.error("Failed to cancel friend request!");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["current_user", currentUser]);
      queryClient.invalidateQueries(["user", username]);
    },
  });

  // follow/unfollow mutation
  const mutation = useMutation({
    mutationFn: (isFollowing) =>
      axiosSecure.put(`/${isFollowing ? "unfollow" : "follow"}/${user._id}`, {
        current_id: current_user._id,
      }),
    onMutate: async (isFollowing) => {
      await queryClient.cancelQueries();
      const prevCurrent = queryClient.getQueryData([
        "current_user",
        currentUser,
      ]);

      const prevTarget = queryClient.getQueryData(["user", username]);

      queryClient.setQueryData(["current_user", currentUser], (old) => ({
        ...old,
        following: isFollowing
          ? old?.following?.filter((id) => id !== user._id) || []
          : [...(old?.following || []), user._id],
      }));

      queryClient.setQueryData(["user", username], (old) => ({
        ...old,
        followers: isFollowing
          ? old?.followers?.filter((id) => id !== current_user._id) || []
          : [...(old?.followers || []), current_user._id],
      }));

      toast.success(
        `${isFollowing ? "Unfollowed" : "Following"} successfully!`
      );
      return { prevCurrent, prevTarget };
    },
    onError: (err, isFollowing, context) => {
      queryClient.setQueryData(
        ["current_user", currentUser],
        context.prevCurrent
      );
      queryClient.setQueryData(["user", username], context.prevTarget);
      toast.error(`Failed to ${isFollowing ? "unfollow" : "follow"}!`);
    },
    onSettled: () => queryClient.invalidateQueries(),
  });

  const isFriend = current_user?.friends?.includes(user._id);
  const hasPendingRequest = user?.pendingRequests?.includes(current_user._id);
  const hasSentRequest = current_user?.sentRequests?.includes(user._id);
  const isFollowing = current_user?.following?.includes(user._id);

  const handleSendFriendRequest = () => sendFriendRequestMutation.mutate();
  const handleCancelFriendRequest = () => cancelFriendRequestMutation.mutate();
  const handleFollowToggle = () => mutation.mutate(isFollowing);

  if (currentUserLoading || targetedUserLoading)
    return (
      <div className="my-10 text-center">
        <span className="loading loading-bars loading-lg"></span>
      </div>
    );

  return (
    <div>
      <div className="relative">
        <img
          className="w-full md:h-72 lg:h-[450px] object-cover border-2 rounded-xl"
          src={user?.banner}
          alt="banner"
        />
        <div className="absolute -bottom-28 left-5 flex items-center gap-5">
          <img
            className="w-40 h-40 object-cover border-4 rounded-full"
            src={user?.image}
            alt="profile"
          />
          <div className="mt-3">
            <h2 className="text-xl font-semibold">{user?.name}</h2>
            <p>{user?.friends?.length || 0} friends</p>
            <p>{user?.followers?.length || 0} followers</p>
          </div>
        </div>
      </div>
      <div className="flex gap-3 justify-end mt-5">
        {hasSentRequest ? (
          <button
            onClick={handleCancelFriendRequest}
            disabled={cancelFriendRequestMutation.isLoading}
            className="px-4 py-2 font-bold rounded-md bg-gray-500 text-white"
          >
            Cancel Request
          </button>
        ) : (
          <button
            onClick={handleSendFriendRequest}
            disabled={
              sendFriendRequestMutation.isLoading ||
              isFriend ||
              hasPendingRequest
            }
            className={`px-4 py-2 font-bold rounded-md ${
              isFriend
                ? "bg-gray-500 text-white"
                : hasPendingRequest
                ? "bg-gray-500 text-white"
                : "bg-black text-white"
            }`}
          >
            {isFriend
              ? "Friends"
              : hasPendingRequest
              ? "Request Sent"
              : "Add Friend"}
          </button>
        )}
        <button
          onClick={handleFollowToggle}
          disabled={mutation.isLoading}
          className={`w-24 py-2 px-4 font-bold rounded-md ${
            isFollowing ? "bg-gray-500 text-white" : "bg-black text-white"
          }`}
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
