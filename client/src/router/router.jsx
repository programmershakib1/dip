import { createBrowserRouter } from "react-router-dom";
import SignIn from "./../pages/authentication/SignIn";
import SignUp from "./../pages/authentication/SignUp";
import MainLayout from "./../layouts/MainLayout";
import PendingPosts from "../pages/PendingPosts";
import ErrorPage from "./../pages/ErrorPage";
import PrivateRoute from "./PrivateRoute";
import Profile from "../pages/Profile";
import NewsFeed from "../pages/NewsFeed";

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
