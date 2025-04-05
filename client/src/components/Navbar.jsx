import { Link } from "react-router-dom";
import useAuth from "./../hooks/useAuth";

const Navbar = () => {
  const { user, handleSingOut } = useAuth();
  return (
    <div className="mx-5 md:mx-0 flex justify-between items-center my-10">
      <div>
        <Link to="/" className="text-3xl font-black">
          DIP
        </Link>
      </div>
      <div className="flex gap-5 md:gap-10 lg:gap-20 items-center">
        <Link to="/">
          <i className="fa-solid fa-house text-3xl"></i>
        </Link>
        <Link to="/friends">
          <i className="fa-solid fa-user-group text-3xl"></i>
        </Link>
        <Link to="/pending-posts">
          <i className="fa-solid fa-clock text-[33px]"></i>
        </Link>
        <Link to="/notifications">
          <i className="fa-solid fa-bell text-4xl"></i>
        </Link>
        <Link to="/profile">
          <i className="fa-solid fa-user text-[33px]"></i>
        </Link>
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
