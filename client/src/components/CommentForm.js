import React, { useState } from "react";

function CommentForm({
  loading,
  error,
  onSubmit,
  autoFocus = false,
  initalValue = "",
}) {
  const [message, setMessage] = useState(initalValue);

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(message).then(() => setMessage(""));
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="comment-form-row">
        <textarea
          className="message-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          autoFocus={autoFocus}
        />
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Loading" : "Post"}
        </button>
      </div>
      <div className="error-msg">{error}</div>
    </form>
  );
}

export default CommentForm;
