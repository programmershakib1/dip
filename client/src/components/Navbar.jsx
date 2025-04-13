import { Link, NavLink } from "react-router-dom";
import useAuth from "./../hooks/useAuth";
import logo from "./../assets/logo.png";

const Navbar = () => {
  const { user, handleSingOut } = useAuth();
  return (
    <div className="mx-5 md:mx-0 md:flex justify-between items-center my-5 md:my-10">
      <NavLink to="/" className="text-3xl font-black hidden md:block">
        <img className="w-12 h-12" src={logo} alt="logo" />
      </NavLink>
      <div className="flex justify-between items-center md:gap-10 lg:gap-20">
        <NavLink to="/">
          <i className="fa-solid fa-house text-3xl"></i>
        </NavLink>
        <NavLink to="/friends">
          <i className="fa-solid fa-user-group text-3xl"></i>
        </NavLink>
        <NavLink to="/pending-posts">
          <i className="fa-solid fa-clock text-[33px]"></i>
        </NavLink>
        <NavLink to="/notifications">
          <i className="fa-solid fa-bell text-4xl"></i>
        </NavLink>
        <NavLink to="/profile">
          <i className="fa-solid fa-user text-[33px]"></i>
        </NavLink>
        <NavLink to="/settings">
          <i className="fa-solid fa-gear text-4xl"></i>
        </NavLink>
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
