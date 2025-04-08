import { createBrowserRouter } from "react-router-dom";
import SignIn from "./../pages/authentication/SignIn";
import SignUp from "./../pages/authentication/SignUp";
import FriendRequests from "../pages/FriendRequests";
import Notifications from "../pages/Notifications";
import MainLayout from "./../layouts/MainLayout";
import PendingPosts from "../pages/PendingPosts";
import ProfilePage from "../pages/ProfilePage";
import ErrorPage from "./../pages/ErrorPage";
import GetStarted from "../pages/GetStarted";
import PrivateRoute from "./PrivateRoute";
import NewsFeed from "../pages/NewsFeed";
import Settings from "../pages/Settings";
import Profile from "../pages/Profile";

const router = createBrowserRouter([
  {
    path: "/getStarted",
    element: <GetStarted></GetStarted>,
  },
  {
    path: "/",
    element: (
      <PrivateRoute>
        <MainLayout></MainLayout>
      </PrivateRoute>
    ),
    errorElement: <ErrorPage></ErrorPage>,
    children: [
      {
        path: "/",
        element: <NewsFeed></NewsFeed>,
      },
      {
        path: "/friends",
        element: <FriendRequests></FriendRequests>,
      },
      {
        path: "/pending-posts",
        element: <PendingPosts></PendingPosts>,
      },
      {
        path: "/notifications",
        element: <Notifications></Notifications>,
      },
      {
        path: "/profile",
        element: <Profile></Profile>,
      },
      {
        path: "/:username",
        element: <ProfilePage></ProfilePage>,
      },
      {
        path: "/settings",
        element: <Settings></Settings>,
      },
    ],
  },
  {
    path: "/signin",
    element: <SignIn></SignIn>,
  },
  {
    path: "/signup",
    element: <SignUp></SignUp>,
  },
]);

export default router;
