import {
  useLikeMutation,
  useCommentMutation,
  useDeleteCommentMutation,
  useEditCommentMutation,
} from "../utils/usePostMutations";

const usePostActions = (queryKey, userId) => {
  const likeMutation = useLikeMutation(queryKey, userId);
  const commentMutation = useCommentMutation(queryKey, userId);
  const deleteCommentMutation = useDeleteCommentMutation(queryKey);
  const editCommentMutation = useEditCommentMutation(queryKey);

  return {
    handleLike: (postId) => likeMutation.mutate(postId),
    handleComment: (postId, commentText) =>
      commentText.trim() &&
      commentMutation.mutate({ postId, comment: commentText }),
    handleDeleteComment: (postId, commentId) =>
      deleteCommentMutation.mutate({ postId, commentId }),
    handleEditComment: (postId, commentId, comment) =>
      editCommentMutation.mutate({ postId, commentId, comment }),
  };
};

export default usePostActions;
