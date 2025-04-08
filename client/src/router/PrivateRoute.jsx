import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import PropTypes from "prop-types";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="text-center my-10">
        <span className="loading loading-bars loading-lg"></span>
      </div>
    );
  }

  if (user) {
    return children;
  }

  return <Navigate to="/getStarted"></Navigate>;
};

PrivateRoute.propTypes = {
  children: PropTypes.element,
};

export default PrivateRoute;
