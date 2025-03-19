import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const FriendRequestList = ({ request, refetchUserData, current_id }) => {
  const [userData, setUserData] = useState(null);
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUserData = async () => {
      const response = await axiosSecure.get(`/user_id/${request}`);
      setUserData(response.data);
    };
    fetchUserData();
  }, [request, axiosSecure]);

  // accept friend request mutation
  const acceptFriendRequestMutation = useMutation({
    mutationFn: () =>
      axiosSecure.put(`/accept-friend-request/${request}`, {
        current_id: current_id,
      }),
    onMutate: async () => {
      await queryClient.cancelQueries(["my-data"]);
      const prevData = queryClient.getQueryData(["my-data"]);

      queryClient.setQueryData(["my-data"], (old) => {
        if (!old) return old;
        return {
          ...old,
          user_data: {
            ...old.user_data,
            friends: [...(old.user_data.friends || []), request],
            pendingRequests: old.user_data.pendingRequests.filter(
              (id) => id !== request
            ),
          },
        };
      });

      toast.success("Friend request accepted!");
      return { prevData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["my-data"], context.prevData);
      toast.error("Failed to accept friend request!");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["my-data"]);
      refetchUserData();
    },
  });

  // reject friend request mutation
  const rejectFriendRequestMutation = useMutation({
    mutationFn: () =>
      axiosSecure.put(`/reject-friend-request/${request}`, {
        current_id: current_id,
      }),
    onMutate: async () => {
      await queryClient.cancelQueries(["my-data"]);
      const prevData = queryClient.getQueryData(["my-data"]);

      queryClient.setQueryData(["my-data"], (old) => {
        if (!old) return old;
        return {
          ...old,
          user_data: {
            ...old.user_data,
            pendingRequests: old.user_data.pendingRequests.filter(
              (id) => id !== request
            ),
          },
        };
      });

      toast.success("Friend request rejected!");
      return { prevData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["my-data"], context.prevData);
      toast.error("Failed to reject friend request!");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["my-data"]);
      refetchUserData();
    },
  });

  const handleAccept = () => acceptFriendRequestMutation.mutate();
  const handleReject = () => rejectFriendRequestMutation.mutate();

  return (
    <div className="flex items-center justify-between gap-3 bg-gray-200 border p-3 rounded-xl">
      <div>
        <h3>{userData?.name}</h3>
        <p>{userData?.email}</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleAccept}
          disabled={acceptFriendRequestMutation.isLoading}
          className="w-24 bg-green-500 text-white py-2 px-2 font-bold rounded-md"
        >
          Accept
        </button>
        <button
          onClick={handleReject}
          disabled={rejectFriendRequestMutation.isLoading}
          className="w-24 bg-red-500 text-white py-2 px-2 font-bold rounded-md"
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export default FriendRequestList;
