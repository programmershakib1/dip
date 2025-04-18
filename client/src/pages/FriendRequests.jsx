import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";

const FriendRequests = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  // fetch current user data
  const {
    data: userData = {},
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["userData", user?.email],
    queryFn: async () => {
      const { data } = await axiosSecure.get(`/user/${user?.email}`);
      return data;
    },
  });

  // fetch user data for all pending requests
  const pendingRequestIds = userData?.pendingRequests || [];
  const { data: requestUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ["request-users", pendingRequestIds],
    queryFn: async () => {
      if (!pendingRequestIds.length) return [];
      const response = await axiosSecure.post("/users-by-ids", {
        userIds: pendingRequestIds,
      });
      return response.data;
    },
    enabled: !!pendingRequestIds.length && !isLoading,
  });

  // accept friend request mutation
  const acceptFriendRequestMutation = useMutation({
    mutationFn: (requestId) =>
      axiosSecure.put(`/accept-friend-request/${requestId}`, {
        currentId: userData?._id,
      }),
    onMutate: async (requestId) => {
      await queryClient.cancelQueries(["userData", user?.email]);
      const prevData = queryClient.getQueryData(["userData", user?.email]);

      queryClient.setQueryData(["userData", user?.email], (old) => {
        if (!old) return old;
        return {
          ...old,
          friends: [...(old.friends || []), requestId],
          pendingRequests: old.pendingRequests.filter((id) => id !== requestId),
        };
      });

      toast.success("Friend request accepted!");
      return { prevData };
    },
    onError: (err, requestId, context) => {
      queryClient.setQueryData(["userData", user?.email], context.prevData);
      toast.error("Failed to accept friend request!");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["userData", user?.email]);
      refetch();
    },
  });

  // reject friend request mutation
  const rejectFriendRequestMutation = useMutation({
    mutationFn: (requestId) =>
      axiosSecure.put(`/reject-friend-request/${requestId}`, {
        currentId: userData?._id,
      }),
    onMutate: async (requestId) => {
      await queryClient.cancelQueries(["userData", user?.email]);
      const prevData = queryClient.getQueryData(["userData", user?.email]);

      queryClient.setQueryData(["userData", user?.email], (old) => {
        if (!old) return old;
        return {
          ...old,
          pendingRequests: old.pendingRequests.filter((id) => id !== requestId),
        };
      });

      toast.success("Friend request rejected!");
      return { prevData };
    },
    onError: (err, requestId, context) => {
      queryClient.setQueryData(["userData", user?.email], context.prevData);
      toast.error("Failed to reject friend request!");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["userData", user?.email]);
      refetch();
    },
  });

  const handleAccept = (requestId) =>
    acceptFriendRequestMutation.mutate(requestId);
  const handleReject = (requestId) =>
    rejectFriendRequestMutation.mutate(requestId);

  if (isLoading || usersLoading) {
    return (
      <div className="my-10 text-center">
        <span className="loading loading-bars loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="mx-5 md:mx-0 grid lg:grid-cols-9">
      <div className="col-span-2"></div>
      <div className="col-span-5 mb-5">
        {requestUsers.length > 0 && (
          <h2 className="text-md font-bold mb-3">
            Friend Requests{" "}
            <span className="text-lg text-red-500">{requestUsers?.length}</span>
          </h2>
        )}
        {requestUsers.length > 0 ? (
          requestUsers.map((requestUser) => (
            <div key={requestUser._id} className="grid grid-cols-10 gap-2 mb-2">
              <Link to={`/${requestUser?.username}`} className="col-span-3 w-24 h-24">
                <img
                  className="w-24 h-24 object-cover rounded-full"
                  src={requestUser.profile}
                  alt={requestUser.name}
                />
              </Link>
              <div className="col-span-7 flex flex-col justify-center">
                <Link to={`/${requestUser?.username}`}>
                  <h3 className="md:text-xl font-semibold">
                    {requestUser.name}
                  </h3>
                </Link>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleAccept(requestUser._id)}
                    disabled={acceptFriendRequestMutation.isLoading}
                    className="w-full bg-blue-600 text-white py-2 px-2 font-bold text-xs md:text-base rounded-md"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(requestUser._id)}
                    disabled={rejectFriendRequestMutation.isLoading}
                    className="w-full bg-gray-300 py-2 px-2 text-xs md:text-base font-bold rounded-md"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <h2 className="text-center text-gray-500">
            No pending friend requests.
          </h2>
        )}
      </div>
      <div className="col-span-2"></div>
    </div>
  );
};

export default FriendRequests;
