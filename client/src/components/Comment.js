import React, { useState } from "react";
import IcontBtn from "./IcontBtn";
import { FaEdit, FaHeart, FaReply, FaTrash } from "react-icons/fa";
import { usePost } from "../contexts/PostContext";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";
import { useAsyncFn } from "../hooks/useAsync";
import { createComment } from "../services/comments";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

function Comment({ id, message, user, createdAt }) {
  const { post, getReplies, createLocalComment } = usePost();
  const createCommentFn = useAsyncFn(createComment);
  const childComments = getReplies(id);
  const [areChildrenHidden, setAreChildrenHidden] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  function onCommentReply(message) {
    return createCommentFn
      .execute({
        postId: post.id,
        message,
        parentId: id,
      })
      .then((comment) => {
        setIsReplying(false);
        createLocalComment(comment);
      });
  }

  return (
    <>
      <div className="comment">
        <div className="header">
          <span className="name">{user.name}</span>
          <span className="data">
            {dateFormatter.format(Date.parse(createdAt))}
          </span>
        </div>
        <div className="message">{message}</div>
        <div className="footer">
          <IcontBtn Icon={FaHeart} aria-label="Like">
            2
          </IcontBtn>
          <IcontBtn
            Icon={FaReply}
            aria-label={isReplying ? "Cancel Reply" : "Reply"}
            onClick={() => setIsReplying((prev) => !prev)}
            isActive={isReplying}
          />
          <IcontBtn Icon={FaEdit} aria-label="Edit" />
          <IcontBtn Icon={FaTrash} aria-label="Delete" color="danger" />
        </div>
      </div>
      {isReplying && (
        <div className="mt-1 ml-3">
          <CommentForm
            autofocus
            onSubmit={onCommentReply}
            loading={createCommentFn.error}
            error={createCommentFn.error}
          />
        </div>
      )}
      {childComments?.length > 0 && (
        <>
          <div
            className={`nested-comments-stack ${
              areChildrenHidden ? "hide" : ""
            }`}
          >
            <button
              className="collapse-line"
              aria-label="Hide Replies"
              onClick={() => setAreChildrenHidden(true)}
            />
            <div className="nested-comments">
              <CommentList comments={childComments} />
            </div>
          </div>
          <button
            className={`btn mt-1 ${!areChildrenHidden ? "hide" : ""}`}
            onClick={() => setAreChildrenHidden(false)}
          >
            Show Replies
          </button>
        </>
      )}
    </>
  );
}

export default Comment;
