import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { getPost } from "../services/posts";
const Context = createContext();

// shares state with many different components
export function usePost() {
  return useContext(Context);
}

export function PostProvider({ children }) {
  const { id } = useParams();
  const { loading, error, value: post } = useAsync(() => getPost(id), [id]);
  const [comments, setComments] = useState([]);

  // only create commentsByParentId array anytime the post or comments change
  const commentsByParentId = useMemo(() => {
    if (comments == null) return [];
    const group = {};
    comments.forEach((comment) => {
      group[comment.parentId] ||= [];
      group[comment.parentId].push(comment);
    });
    return group;
  }, [comments]);

  useEffect(() => {
    if (post?.comments == null) return;
    setComments(post.comments);
  }, [post?.comments]);

  function getReplies(parentId) {
    return commentsByParentId[parentId];
  }

  function createLocalComment(comment) {
    setComments((prevComments) => {
      return [comment, ...prevComments];
    });
  }

  return (
    <Context.Provider
      value={{
        post: { id, ...post },
        getReplies,
        createLocalComment,
        rootComments: commentsByParentId[null],
      }}
    >
      {loading ? (
        <h1>Loading</h1>
      ) : error ? (
        <h1 className="error-msg">{error}</h1>
      ) : (
        children
      )}
    </Context.Provider>
  );
}
