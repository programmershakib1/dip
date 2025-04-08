import { Link } from "react-router-dom";

const GetStarted = () => {
  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
      <h2 className="text-2xl font-bold mb-4">Get Started</h2>
      <div className="flex gap-4 justify-center items-center mb-4">
        <Link to="/signin">
          <button className="bg-blue-600 hover:bg-blue-800 text-white font-bold px-10 md:px-16 py-2 rounded-full whitespace-nowrap">
            Log in
          </button>
        </Link>
        <Link to="/signup">
          <button className="bg-blue-600 hover:bg-blue-800 text-white font-bold px-10 md:px-16 py-2 rounded-full whitespace-nowrap">
            Sign up
          </button>
        </Link>
      </div>
      <button className="hover:bg-zinc-200 font-semibold px-10 md:px-16 py-2 rounded-full">
        Try it first
      </button>
    </div>
  );
};

export default GetStarted;
