import useAxiosSecure from "../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import { getTimeAgo } from "../utils/utils";
import Swal from "sweetalert2";

const PendingPosts = () => {
  const axiosSecure = useAxiosSecure();

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
        {posts.map((post, idx) => (
          <div key={idx} className="p-5 border border-black rounded-xl mb-5">
            <div className="flex items-center">
              <img
                src={post?.user_data?.image}
                alt="profile"
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <h1 className="font-semibold">{post?.user_data?.name}</h1>
                <p className="text-gray-500 text-sm">
                  {getTimeAgo(post?.posted_at)}
                </p>
              </div>
            </div>
            {post?.caption && <p className="mt-3">{post?.caption}</p>}
            {post?.image && (
              <img src={post?.image} alt="post" className="w-full h-96 mt-3" />
            )}
            {/* action */}
            <div className="flex gap-5 mt-5">
              {/* approve button */}
              <button
                onClick={() => handleApprovePost(post?._id)}
                className="bg-green-500 text-white py-2 px-4 rounded-md"
              >
                Approve
              </button>
              {/* reject button */}
              <button
                onClick={() => handleRejectPost(post?._id)}
                className="bg-red-500 text-white py-2 px-6 rounded-md"
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
