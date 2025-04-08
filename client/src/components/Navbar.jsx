import useAuth from "./../hooks/useAuth";
import { Link } from "react-router-dom";
import logo from "./../assets/logo.png";

const Navbar = () => {
  const { user, handleSingOut } = useAuth();
  return (
    <div className="mx-5 md:mx-0 md:flex justify-between items-center my-10">
      <Link to="/" className="text-3xl font-black hidden md:block">
        <img className="w-12 h-12" src={logo} alt="logo" />
      </Link>
      <div className="flex justify-center items-center gap-7 md:gap-10 lg:gap-20">
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
        <Link to="/settings">
          <i className="fa-solid fa-gear text-4xl"></i>
        </Link>
      </div>
      <div className="hidden md:block">
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
              Log Out
            </button>
          ) : (
            <Link
              to="/signin"
              className="font-bold bg-black text-white py-2 px-6 rounded-full"
            >
              Log In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
