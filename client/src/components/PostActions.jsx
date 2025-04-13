import useAxiosSecure from "../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";

const PostActions = ({ post, isLiked, onLike, onComment, currentUser }) => {
  const axiosSecure = useAxiosSecure();

  const { data: likedUsers = [], isLoading } = useQuery({
    queryKey: ["users-by-ids", post?._id, post?.liked_by],
    queryFn: async () => {
      if (!post?.liked_by || post.liked_by.length === 0) return [];
      try {
        const { data } = await axiosSecure.post("/users-by-ids", {
          userIds: post.liked_by,
        });
        return data || [];
      } catch {
        return [];
      }
    },
    enabled: !!post?.liked_by && post.liked_by.length > 0,
    staleTime: 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
    keepPreviousData: true,
  });

  const formatLikeInfo = () => {
    const likedCount = post?.liked_by?.length || 0;

    if (isLoading && likedCount > 0) {
      return "Like loading...";
    }

    if (likedCount === 0) return "";

    const currentUserId = currentUser?._id || "";
    const otherUsers = likedUsers.filter(
      (user) => user?._id && user._id !== currentUserId
    );

    // 1 like
    if (likedCount === 1) {
      if (isLiked || post.liked_by[0] === currentUserId) {
        return currentUser?.name || "You";
      }
      return otherUsers[0]?.name || likedUsers[0]?.name || "";
    }

    // 2 likes
    if (likedCount === 2) {
      if (isLiked) {
        return otherUsers[0]?.name
          ? `You and ${otherUsers[0].name}`
          : currentUser?.name || "You";
      }
      return otherUsers[0]?.name ? `${otherUsers[0].name} + 1` : "";
    }

    // 3 or more likes
    if (isLiked) {
      return otherUsers[0]?.name
        ? `You, ${otherUsers[0].name} + ${likedCount - 2}`
        : `You + ${likedCount - 1}`;
    }
    return otherUsers[0]?.name
      ? `${otherUsers[0].name} + ${likedCount - 1}`
      : "";
  };

  return (
    <div className="mx-5 md:mx-0 my-3">
      <div className="flex justify-between items-center gap-2">
        <p
          className="text-sm text-gray-600 transition-opacity duration-150 truncate max-w-[200px]"
          title={formatLikeInfo() || ""}
        >
          {formatLikeInfo()}
        </p>
        <p className="text-sm text-gray-600">
          {post?.comments?.length > 0 && (
            <span>{`comments ${post?.comments?.length}`}</span>
          )}
        </p>
      </div>
      <div className="flex justify-between items-center gap-2 mt-1">
        <button
          onClick={() => onLike(post._id)}
          className={`flex items-center gap-2 transition-colors duration-200 ${
            isLiked ? "text-blue-500" : "text-gray-600"
          }`}
        >
          <i className="fa-solid fa-thumbs-up text-3xl"></i>
          <span>Like</span>
        </button>
        <button onClick={onComment} className="flex items-center gap-2">
          <i className="fa-solid fa-comment text-3xl text-gray-600"></i>
          <span className="text-gray-600">Comment</span>
        </button>
        <button className="flex items-center gap-2">
          <i className="fa-solid fa-share-nodes text-3xl text-gray-600"></i>
          <span className="text-gray-600">Share</span>
        </button>
      </div>
    </div>
  );
};

export default PostActions;
