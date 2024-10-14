import React, { useEffect, useState } from "react";

const emojis = ["😁", "😂", "😍", "🤔", "😎", "😢", "😡", "😱", "🤯"];

const playback = ["⏯️", "⏪", "⏩"];
const playbackMap = {
  "⏯️": "playPause",
  "⏪": "rewind",
  "⏩": "forward",
};

const EmojiGrid = ({ socket, name, allowPlayback }) => {
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    let timeoutId;
    if (disabled) {
      timeoutId = setTimeout(() => {
        setDisabled(false);
      }, 5000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [disabled]);

  const handleEmojiClick = (reaction) => {
    socket.emit("reaction", { name, reaction });
    setDisabled(true);
  };

  const handlePlaybackClick = (action) => {
    socket.emit("action", { name, action: playbackMap[action] });
    setDisabled(true);
  };

  return (
    <div style={styles.grid}>
      {emojis.map((emoji, index) => (
        <button
          key={index}
          disabled={disabled}
          style={{
            ...styles.button,
            ...(disabled ? styles.disabled : {}),
          }}
          onClick={() => handleEmojiClick(emoji)}
        >
          {emoji}
        </button>
      ))}

      {allowPlayback
        ? playback.map((emoji, index) => (
            <button
              key={index}
              disabled={disabled}
              style={{
                ...styles.button,
                ...(disabled ? styles.disabled : {}),
              }}
              onClick={() => handlePlaybackClick(emoji)}
            >
              {emoji}
            </button>
          ))
        : null}
    </div>
  );
};

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 100px)",
    gap: "10px",
    margin: "20px",
  },
  button: {
    fontSize: "24px",
    padding: "20px",
    cursor: "pointer",
    borderRadius: "10px",
  },
  disabled: {
    opacity: "0.5",
  },
};

export default EmojiGrid;
