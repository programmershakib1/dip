import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import toast from "react-hot-toast";

const FollowButton = ({ targetUserId, currentUserData, queryKey }) => {
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
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => ({
        ...old,
        currentUserData: {
          ...old.currentUserData,
          following: isFollowing
            ? old.currentUserData?.following?.filter(
                (id) => id !== targetUserId
              ) || []
            : [...(old.currentUserData?.following || []), targetUserId],
        },
        userData: {
          ...old.userData,
          followers: isFollowing
            ? old.userData?.followers?.filter(
                (id) => id !== currentUserData._id
              ) || []
            : [...(old.userData?.followers || []), currentUserData._id],
        },
      }));

      toast.success(
        `${isFollowing ? "Unfollowed" : "Following"} successfully!`
      );
      return { previousData };
    },
    onError: (err, isFollowing, context) => {
      queryClient.setQueryData(queryKey, context.previousData);
      toast.error(`Failed to ${isFollowing ? "unfollow" : "follow"}!`);
    },
    onSettled: () => {
      queryClient.invalidateQueries(queryKey, { exact: true });
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
