import useAxiosSecure from "../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import { getTimeAgo } from "../utils/utils";
import { Link } from "react-router-dom";
import { useState } from "react";
import Swal from "sweetalert2";

const PendingPosts = () => {
  const axiosSecure = useAxiosSecure();
  const [expandedCaption, setExpandedCaption] = useState(false);

  // get pending posts
  const {
    data: posts = [],
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["pending-posts"],
    queryFn: async () => {
      const { data } = await axiosSecure.get("/pending-posts");
      return data;
    },
  });

  // handle approve
  const handleApprovePost = (id) => {
    axiosSecure.post(`/approve-post/${id}`).then((res) => {
      if (res.data.insertedId) {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Post approved successfully",
          showConfirmButton: false,
          timer: 1500,
        });
      }
      refetch();
    });
  };

  // handle reject
  const handleRejectPost = (id) => {
    axiosSecure.patch(`/reject-post/${id}`).then((res) => {
      if (res.data.modifiedCount > 0) {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Post rejected successfully",
          showConfirmButton: false,
          timer: 1500,
        });
      }
      refetch();
    });
  };

  if (isLoading)
    return (
      <div className="my-10 text-center">
        <span className="loading loading-bars loading-lg"></span>
      </div>
    );

  return (
    <div className="grid lg:grid-cols-9">
      <div className="col-span-2"></div>
      <div className="col-span-5">
        {posts.length > 0 && (
          <h2 className="mx-5 md:mx-0 text-md font-bold mb-3">
            Pending Posts{" "}
            <span className="text-lg text-red-500">{posts?.length}</span>
          </h2>
        )}
        {posts.length === 0 && (
          <div>
            <h2 className="text-center text-gray-500">
              No pending posts found.
            </h2>
          </div>
        )}
        {posts.map((post, idx) => (
          <div
            key={idx}
            className="mb-4 md:p-5 border-t-[3px] border-gray-400 md:border md:border-black md:rounded-xl"
          >
            <div className="mt-3 mx-5 md:mx-0 flex items-center">
              <Link to={`/${post?.userData?.username}`}>
                <img
                  src={post?.userData?.profile}
                  alt="profile"
                  className="w-10 h-10 rounded-full mr-3"
                />
              </Link>
              <div>
                <Link to={`/${post?.userData?.username}`}>
                  <h1 className="font-semibold">{post?.userData?.name}</h1>
                </Link>
                <p className="text-gray-500 text-sm">
                  {getTimeAgo(post?.postedAt)}
                </p>
              </div>
            </div>
            {post?.caption && (
              <div className="mt-3 mx-5 md:mx-0">
                {expandedCaption || post.caption.length <= 200 ? (
                  <p>{post.caption}</p>
                ) : (
                  <>
                    <p>
                      {post.caption.slice(0, 125)}...
                      <button
                        className="text-gray-500 hover:underline ml-1"
                        onClick={() => setExpandedCaption(true)}
                      >
                        See more
                      </button>
                    </p>
                  </>
                )}
                {expandedCaption && post.caption.length > 200 && (
                  <button
                    className="text-gray-500 hover:underline mt-1"
                    onClick={() => setExpandedCaption(false)}
                  >
                    See less
                  </button>
                )}
              </div>
            )}
            {post?.image && (
              <img
                src={post?.image}
                alt="post"
                className="mt-3 w-full max-h-[30vh] md:max-h-[70vh] rounded-lg"
              />
            )}
            {/* action */}
            <div className="mx-5 md:mx-0 flex justify-between items-center gap-3 mt-5">
              {/* approve button */}
              <button
                onClick={() => handleApprovePost(post?._id)}
                className="w-full bg-green-500 text-white py-2 px-4 rounded-md"
              >
                Approve
              </button>
              {/* reject button */}
              <button
                onClick={() => handleRejectPost(post?._id)}
                className="w-full bg-red-500 text-white py-2 px-6 rounded-md"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="col-span-2"></div>
    </div>
  );
};

export default PendingPosts;
