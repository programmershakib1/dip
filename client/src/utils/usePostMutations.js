import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../hooks/useAxiosSecure";
import toast from "react-hot-toast";

export const useLikeMutation = (queryKey, userEmail) => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId) =>
      axiosSecure.post(`/like-post/${postId}`, { user_email: userEmail }),
    onMutate: async (postId) => {
      await queryClient.cancelQueries(queryKey);
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => {
        const posts = Array.isArray(old) ? old : old?.posts || [];
        const updatedPosts = posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                liked_by: post.liked_by.includes(userEmail)
                  ? post.liked_by.filter((email) => email !== userEmail)
                  : [...post.liked_by, userEmail],
              }
            : post
        );
        return Array.isArray(old)
          ? updatedPosts
          : { ...old, posts: updatedPosts };
      });

      return { previousData };
    },
    onError: (err, postId, context) => {
      queryClient.setQueryData(queryKey, context.previousData);
      toast.error("Failed to like post!");
    },
    onSettled: () => queryClient.invalidateQueries(queryKey),
  });
};

export const useCommentMutation = (queryKey, userId) => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, comment }) =>
      axiosSecure.post(`/add-comment/${postId}`, { user_id: userId, comment }),
    onMutate: async ({ postId, comment }) => {
      await queryClient.cancelQueries(queryKey);
      const previousData = queryClient.getQueryData(queryKey);

      const newCommentId = new Date().toISOString();
      queryClient.setQueryData(queryKey, (old) => {
        const posts = Array.isArray(old) ? old : old?.posts || [];
        const updatedPosts = posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: [
                  ...post.comments,
                  {
                    _id: newCommentId,
                    user_id: userId,
                    comment,
                    commentedAt: new Date().toISOString(),
                  },
                ],
              }
            : post
        );
        return Array.isArray(old)
          ? updatedPosts
          : { ...old, posts: updatedPosts };
      });

      return { previousData, newCommentId, postId };
    },
    onSuccess: (data, variables, context) => {
      setTimeout(() => {
        const commentElement = document.getElementById(
          `comment-${context.newCommentId}`
        );
        if (commentElement) {
          commentElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(queryKey, context.previousData);
      toast.error("Failed to add comment!");
    },
    onSettled: () => queryClient.invalidateQueries(queryKey),
  });
};

export const useDeleteCommentMutation = (queryKey) => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, commentId }) =>
      axiosSecure.delete(`/delete-comment/${postId}/${commentId}`),
    onMutate: async ({ postId, commentId }) => {
      await queryClient.cancelQueries(queryKey);
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => {
        const posts = Array.isArray(old) ? old : old?.posts || [];
        const updatedPosts = posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: post.comments.filter(
                  (comment) => comment._id !== commentId
                ),
              }
            : post
        );
        return Array.isArray(old)
          ? updatedPosts
          : { ...old, posts: updatedPosts };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(queryKey, context.previousData);
      toast.error("Failed to delete comment!");
    },
    onSettled: () => queryClient.invalidateQueries(queryKey),
  });
};
