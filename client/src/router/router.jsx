import { createBrowserRouter } from "react-router-dom";
import SignIn from "./../pages/authentication/SignIn";
import SignUp from "./../pages/authentication/SignUp";
import MainLayout from "./../layouts/MainLayout";
import PendingPosts from "../pages/PendingPosts";
import ProfilePage from "../pages/ProfilePage";
import ErrorPage from "./../pages/ErrorPage";
import PrivateRoute from "./PrivateRoute";
import NewsFeed from "../pages/NewsFeed";
import Profile from "../pages/Profile";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout></MainLayout>,
    errorElement: <ErrorPage></ErrorPage>,
    children: [
      {
        path: "/",
        element: <NewsFeed></NewsFeed>,
      },
      {
        path: "/pending-posts",
        element: (
          <PrivateRoute>
            <PendingPosts></PendingPosts>
          </PrivateRoute>
        ),
      },
      {
        path: "/profile",
        element: (
          <PrivateRoute>
            <Profile></Profile>
          </PrivateRoute>
        ),
      },
      {
        path: "/:username",
        element: (
          <PrivateRoute>
            <ProfilePage></ProfilePage>
          </PrivateRoute>
        ),
      },
      {
        path: "/signin",
        element: <SignIn></SignIn>,
      },
      {
        path: "/signup",
        element: <SignUp></SignUp>,
      },
    ],
  },
]);

export default router;
