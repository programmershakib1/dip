import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";

const FollowButton = ({ targetUserId, currentUserData }) => {
  const { user: currentUser } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (isFollowing) =>
      axiosSecure.put(
        `/${isFollowing ? "unfollow" : "follow"}/${targetUserId}`,
        {
          currentId: currentUserData._id,
        }
      ),
    onMutate: (isFollowing) => {
      const prevCurrent = queryClient.getQueryData([
        "current_user",
        currentUser.email,
      ]);
      const prevTarget = queryClient.getQueryData(["user", targetUserId]);

      queryClient.setQueryData(["current_user", currentUser.email], (old) => ({
        ...old,
        following: isFollowing
          ? old?.following?.filter((id) => id !== targetUserId) || []
          : [...(old?.following || []), targetUserId],
      }));

      queryClient.setQueryData(["user", targetUserId], (old) => ({
        ...old,
        followers: isFollowing
          ? old?.followers?.filter((id) => id !== currentUserData._id) || []
          : [...(old?.followers || []), currentUserData._id],
      }));

      toast.success(
        `${isFollowing ? "Unfollowed" : "Following"} successfully!`
      );
      return { prevCurrent, prevTarget };
    },
    onError: (err, isFollowing, context) => {
      queryClient.setQueryData(
        ["current_user", currentUser.email],
        context.prevCurrent
      );
      queryClient.setQueryData(["user", targetUserId], context.prevTarget);
      toast.error(`Failed to ${isFollowing ? "unfollow" : "follow"}!`);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["current_user", currentUser.email], {
        exact: true,
      });
      queryClient.invalidateQueries(["user", targetUserId], { exact: true });
    },
  });

  const isFollowing = currentUserData?.following?.includes(targetUserId);

  const handleFollowToggle = () => mutation.mutate(isFollowing);

  return (
    <div>
      <button
        onClick={handleFollowToggle}
        disabled={mutation.isLoading}
        className={`py-2 px-4 font-bold rounded-md flex items-center justify-center gap-2 ${
          isFollowing
            ? "bg-gray-300 text-gray-800"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        {mutation.isLoading ? (
          <span className="loading loading-spinner"></span>
        ) : isFollowing ? (
          <>
            <i className="fa-solid fa-user-minus"></i> Unfollow
          </>
        ) : (
          <>
            <i className="fa-solid fa-user-plus"></i> Follow
          </>
        )}
      </button>
    </div>
  );
};

export default FollowButton;
