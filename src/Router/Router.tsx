import { Route, Routes } from "react-router-dom";
import LoginPage from "../components/pages/LoginPage/LoginPage";
import PrivateRoute from "./PrivateRoute";
import HomePage from "../components/pages/HomePage";
import UserTable from "../components/pages/UserPage/UserTable";
import UserPage from "../components/pages/UserPage/UserPage";
import authorities from "../config/Authorities";
// @ts-ignore
import GalleryPage from "../components/pages/GalleryPage/GalleryPage";
// @ts-ignore
import MyPosts from "../components/pages/MyPostsPage/MyPosts";
// @ts-ignore
import AdminPostPage from "../components/pages/AdminPostPage/AdminPostPage";

/**
 * Router component renders a route switch with all available pages
 */

const Router = () => {
  /** navigate to different "home"-locations depending on Role the user have */

  return (
    <Routes>
      <Route path={"/"} element={<HomePage />} />
      <Route path={"/login"} element={<LoginPage />} />

      <Route
        path={"/user"}
        element={<PrivateRoute requiredAuths={[]} element={<UserTable />} />}
      />
      <Route
        path="/user/edit"
        element={
          <PrivateRoute
            requiredAuths={[authorities.USER_CREATE]}
            element={<UserPage />}
          ></PrivateRoute>
        }
      />
      <Route
        path="/user/edit/:userId"
        element={
          <PrivateRoute
            requiredAuths={[authorities.USER_CREATE]}
            element={<UserPage />}
          ></PrivateRoute>
        }
      />
      <Route
        path="/gallery"
        element={
          <PrivateRoute
            requiredAuths={[]}
            element={<GalleryPage />}
          ></PrivateRoute>
        }
      />
      <Route
        path="/gallery/my-posts"
        element={
          <PrivateRoute requiredAuths={[]} element={<MyPosts />}></PrivateRoute>
        }
      />
      <Route
        path="/admin/posts"
        element={
          <PrivateRoute
            requiredAuths={[authorities.IMAGE_MODIFY]}
            element={<AdminPostPage />}
          />
        }
      />

      <Route path="*" element={<div>Not Found</div>} />
    </Routes>
  );
};

export default Router;
