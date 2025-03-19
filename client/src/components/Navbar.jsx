import { Link } from "react-router-dom";
import useAuth from "./../hooks/useAuth";

const Navbar = () => {
  const { user, handleSingOut } = useAuth();
  return (
    <div className="flex justify-between items-center my-10">
      <div>
        <Link to="/" className="text-3xl font-black">
          DIP
        </Link>
      </div>
      <div className="flex gap-5">
        <Link to="/">Home</Link>
        <Link to="/pending-posts">Pending Posts</Link>
        <Link to="/profile">Profile</Link>
      </div>
      <div className="flex items-center gap-3">
        <div>
          {user?.photoURL && (
            <img
              className="w-10 h-10 rounded-full object-cover"
              src={user?.photoURL}
              alt=""
            />
          )}
        </div>
        {user ? (
          <button
            onClick={handleSingOut}
            className="font-bold bg-black text-white py-2 px-6 rounded-full"
          >
            Sign Out
          </button>
        ) : (
          <Link
            to="/signin"
            className="font-bold bg-black text-white py-2 px-6 rounded-full"
          >
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
