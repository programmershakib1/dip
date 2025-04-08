import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import toast from "react-hot-toast";

const AddFriendButton = ({ targetUserId, currentUserData, queryKey }) => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const sendFriendRequestMutation = useMutation({
    mutationFn: () =>
      axiosSecure.put(`/send-friend-request/${targetUserId}`, {
        currentId: currentUserData._id,
      }),
    onMutate: () => {
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => ({
        ...old,
        currentUserData: {
          ...old.currentUserData,
          sentRequests: [
            ...(old.currentUserData?.sentRequests || []),
            targetUserId,
          ],
        },
        userData: {
          ...old.userData,
          pendingRequests: [
            ...(old.userData?.pendingRequests || []),
            currentUserData._id,
          ],
        },
      }));

      toast.success("Friend request sent!");
      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(queryKey, context.previousData);
      toast.error("Failed to send friend request!");
    },
    onSettled: () => {
      queryClient.invalidateQueries(queryKey, { exact: true });
    },
  });

  const cancelFriendRequestMutation = useMutation({
    mutationFn: () =>
      axiosSecure.put(`/cancel-friend-request/${targetUserId}`, {
        currentId: currentUserData._id,
      }),
    onMutate: () => {
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => ({
        ...old,
        currentUserData: {
          ...old.currentUserData,
          sentRequests:
            old.currentUserData?.sentRequests?.filter(
              (id) => id !== targetUserId
            ) || [],
        },
        userData: {
          ...old.userData,
          pendingRequests:
            old.userData?.pendingRequests?.filter(
              (id) => id !== currentUserData._id
            ) || [],
        },
      }));

      toast.success("Friend request cancelled!");
      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(queryKey, context.previousData);
      toast.error("Failed to cancel friend request!");
    },
    onSettled: () => {
      queryClient.invalidateQueries(queryKey, { exact: true });
    },
  });

  const isFriend = currentUserData?.friends?.includes(targetUserId);
  const hasPendingRequest =
    currentUserData?.pendingRequests?.includes(targetUserId);
  const hasSentRequest = currentUserData?.sentRequests?.includes(targetUserId);

  const handleSendFriendRequest = () => sendFriendRequestMutation.mutate();
  const handleCancelFriendRequest = () => cancelFriendRequestMutation.mutate();

  return (
    <div>
      {hasSentRequest ? (
        <button
          onClick={handleCancelFriendRequest}
          disabled={cancelFriendRequestMutation.isLoading}
          className="px-4 py-2 font-bold rounded-md bg-gray-300 text-gray-800 flex items-center gap-2"
        >
          {cancelFriendRequestMutation.isLoading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            <>
              <i className="fa-solid fa-user-xmark"></i> Cancel Request
            </>
          )}
        </button>
      ) : (
        <button
          onClick={handleSendFriendRequest}
          disabled={
            sendFriendRequestMutation.isLoading || isFriend || hasPendingRequest
          }
          className={`px-4 py-2 font-bold rounded-md flex items-center gap-2 ${
            isFriend
              ? "bg-gray-300 text-gray-800 cursor-not-allowed"
              : hasPendingRequest
              ? "bg-gray-300 text-gray-800 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {sendFriendRequestMutation.isLoading ? (
            <span className="loading loading-spinner"></span>
          ) : isFriend ? (
            <>
              <i className="fa-solid fa-user-check"></i> Friends
            </>
          ) : hasPendingRequest ? (
            <>
              <i className="fa-solid fa-user-clock"></i> Request Pending
            </>
          ) : (
            <>
              <i className="fa-solid fa-user-plus"></i> Add Friend
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default AddFriendButton;
