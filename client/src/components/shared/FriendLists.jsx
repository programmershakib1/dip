import { Link } from "react-router-dom";

const FriendLists = ({ friendsData }) => {
  return (
    <div className="mx-5 md:mx-0">
      <h2 className="text-lg font-bold">{friendsData?.length} Friends</h2>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-3">
        {friendsData?.map((friend, idx) => (
          <div key={idx}>
            <Link to={`/${friend?.username}`}>
              <img
                className="w-full h-28 object-cover rounded-xl"
                src={friend?.profile}
                alt="profile"
              />
              <h3 className="font-semibold mt-1 hover:underline">
                {friend?.name}
              </h3>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendLists;
