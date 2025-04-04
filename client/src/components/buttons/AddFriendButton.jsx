import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";

const AddFriendButton = ({ targetUserId, currentUserData }) => {
  const { user: currentUser } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const sendFriendRequestMutation = useMutation({
    mutationFn: () =>
      axiosSecure.put(`/send-friend-request/${targetUserId}`, {
        currentId: currentUserData._id,
      }),
    onMutate: () => {
      const prevCurrent = queryClient.getQueryData([
        "current_user",
        currentUser.email,
      ]);
      const prevTarget = queryClient.getQueryData(["user", targetUserId]);

      queryClient.setQueryData(["current_user", currentUser.email], (old) => ({
        ...old,
        sentRequests: [...(old?.sentRequests || []), targetUserId],
      }));

      queryClient.setQueryData(["user", targetUserId], (old) => ({
        ...old,
        pendingRequests: [...(old?.pendingRequests || []), currentUserData._id],
      }));

      toast.success("Friend request sent!");
      return { prevCurrent, prevTarget };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ["current_user", currentUser.email],
        context.prevCurrent
      );
      queryClient.setQueryData(["user", targetUserId], context.prevTarget);
      toast.error("Failed to send friend request!");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["current_user", currentUser.email], {
        exact: true,
      });
      queryClient.invalidateQueries(["user", targetUserId], { exact: true });
    },
  });

  const cancelFriendRequestMutation = useMutation({
    mutationFn: () =>
      axiosSecure.put(`/cancel-friend-request/${targetUserId}`, {
        currentId: currentUserData._id,
      }),
    onMutate: () => {
      const prevCurrent = queryClient.getQueryData([
        "current_user",
        currentUser.email,
      ]);
      const prevTarget = queryClient.getQueryData(["user", targetUserId]);

      queryClient.setQueryData(["current_user", currentUser.email], (old) => ({
        ...old,
        sentRequests:
          old?.sentRequests?.filter((id) => id !== targetUserId) || [],
      }));

      queryClient.setQueryData(["user", targetUserId], (old) => ({
        ...old,
        pendingRequests:
          old?.pendingRequests?.filter((id) => id !== currentUserData._id) ||
          [],
      }));

      toast.success("Friend request cancelled!");
      return { prevCurrent, prevTarget };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ["current_user", currentUser.email],
        context.prevCurrent
      );
      queryClient.setQueryData(["user", targetUserId], context.prevTarget);
      toast.error("Failed to cancel friend request!");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["current_user", currentUser.email], {
        exact: true,
      });
      queryClient.invalidateQueries(["user", targetUserId], { exact: true });
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
