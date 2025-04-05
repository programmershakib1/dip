import AddFriendButton from "../components/buttons/AddFriendButton";
import FollowButton from "../components/buttons/FollowButton";
import useAxiosSecure from "../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ProfilePage = () => {
  const { user: currentUser } = useAuth();
  const axiosSecure = useAxiosSecure();
  const { username } = useParams();

  const { data: current_user = {}, isLoading: currentUserLoading } = useQuery({
    queryKey: ["current_user", currentUser?.email],
    queryFn: () =>
      axiosSecure.get(`/user/${currentUser?.email}`).then((res) => res.data),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  const { data: user = {}, isLoading: targetedUserLoading } = useQuery({
    queryKey: ["user", username],
    queryFn: () =>
      axiosSecure.get(`/username/${username}`).then((res) => res.data),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  if (currentUserLoading || targetedUserLoading) {
    return (
      <div className="my-10 text-center">
        <span className="loading loading-bars loading-lg"></span>
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        <img
          className="w-full md:h-72 lg:h-[450px] object-cover border-2 rounded-xl"
          src={user?.cover}
          alt="banner"
        />
        <div className="absolute -bottom-28 left-5 flex items-center gap-5">
          <img
            className="w-40 h-40 object-cover border-4 rounded-full"
            src={user?.profile}
            alt="profile"
          />
          <div className="mt-3">
            <h2 className="text-xl font-semibold">{user?.name}</h2>
            <div className="flex items-center gap-3">
              <p>{user?.friends?.length || 0} friends</p>
              <p>{user?.followers?.length || 0} followers</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-3 justify-end mt-5">
        <AddFriendButton
          targetUserId={user._id}
          currentUserData={current_user}
        />
        <FollowButton targetUserId={user._id} currentUserData={current_user} />
      </div>
    </div>
  );
};

export default ProfilePage;
