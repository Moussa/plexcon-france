import { io } from "socket.io-client";
import logo from "./plex-logo-full-color-on-black.png";
import "./App.css";
import { useCallback, useEffect, useState } from "react";
import EmojiGrid from "./EmojiGrid";

function PosterButton({ poster, selectedPoster, src, onClick }) {
  return (
    <div style={styles.posterButtonContainer}>
      {selectedPoster === poster ? (
        <div style={styles.posterCheckmark}>✅</div>
      ) : null}
      <button
        disabled={!!selectedPoster}
        style={{
          ...styles.posterButton,
          ...(selectedPoster === poster ? styles.selectedPosterButton : {}),
        }}
        onClick={onClick}
      >
        <img
          alt="poster"
          style={{
            ...styles.poster,
            ...(selectedPoster ? styles.disabledPoster : {}),
          }}
          src={src}
        />
      </button>
    </div>
  );
}

function App() {
  const [socket, setSocket] = useState(null);
  const [name, setName] = useState("");
  const [showSetName, setShowSetName] = useState(true);
  const [showPosters, setShowPosters] = useState(false);
  const [selectedPoster, setSelectedPoster] = useState(null);
  const [showEmojiGrid, setShowEmojiGrid] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const connection = io("wss://172-236-14-4.ip.linodeusercontent.com");
    // const connection = io("ws://localhost:3000");

    setSocket(connection);

    connection.on("connect", () => {
      console.log("WebSocket connected");
    });

    connection.on("state", (state) => {
      if (state === "emojis") {
        setShowPosters(false);
        setShowEmojiGrid(true);
      } else if (state === "posters") {
        setShowPosters(true);
        setShowEmojiGrid(false);
      } else if (state === "playback") {
        setShowPosters(false);
        setShowEmojiGrid(true);
        setShowControls(true);
      }
    });

    connection.on("allowEmojis", () => {
      setShowPosters(false);
      setShowEmojiGrid(true);
    });

    connection.on("allowPlayback", () => {
      setShowPosters(false);
      setShowEmojiGrid(true);
      setShowControls(true);
    });

    connection.io.on("error", (e) => {
      setError(e.message);
    });
  }, []);

  useEffect(() => {
    if (selectedPoster) {
      socket?.emit("posterVote", selectedPoster);
    }
  }, [selectedPoster, socket]);

  const onClickName = useCallback(() => {
    socket?.emit("userConnected", name);
    setShowSetName(false);
  }, [name, socket]);

  const onClickGhost = useCallback(() => {
    setSelectedPoster("ghost");
  }, []);

  const onClickShark = useCallback(() => {
    setSelectedPoster("shark");
  }, []);

  const onClickWerewolf = useCallback(() => {
    setSelectedPoster("werewolf");
  }, []);

  const onInputChange = useCallback((e) => {
    setName(e.target.value);
  }, []);

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        onClickName();
      }
    },
    [onClickName]
  );

  let content;

  if (showSetName) {
    content = (
      <>
        <h1>What's your name?</h1>

        <input
          autoComplete={"off"}
          autoFocus={true}
          data-1p-ignore
          data-lpignore="true"
          value={name}
          style={styles.input}
          type="string"
          onChange={onInputChange}
          onKeyDown={onKeyDown}
        />

        <button
          disabled={name.length === 0}
          style={styles.confirmButton}
          onClick={onClickName}
        >
          Let's Go!
        </button>
      </>
    );
  } else if (showPosters) {
    content = (
      <div style={styles.posters}>
        <PosterButton
          poster="ghost"
          selectedPoster={selectedPoster}
          src="https://images.plex.tv/photo?size=medium-240&scale=2&url=https%3A%2F%2Fmetadata-static.plex.tv%2F1%2Fplex%2F194589e9-cf65-4c01-b962-137d1af2da7d.jpg"
          onClick={onClickGhost}
        />

        <PosterButton
          poster="shark"
          selectedPoster={selectedPoster}
          src="https://images.plex.tv/photo?size=medium-240&scale=2&url=https%3A%2F%2Fmetadata-static.plex.tv%2Ff%2Fgracenote%2Ff776d08ddeeebc8f5ae0c97894e347bc.jpg"
          onClick={onClickShark}
        />

        <PosterButton
          poster="werewolf"
          selectedPoster={selectedPoster}
          src="https://images.plex.tv/photo?size=medium-240&scale=2&url=https%3A%2F%2Fmetadata-static.plex.tv%2Fc%2Fgracenote%2Fc37949552bb3f7545d818cc7e0fb5adb.jpg"
          onClick={onClickWerewolf}
        />
      </div>
    );
  } else if (showEmojiGrid) {
    content = (
      <div style={styles.grid}>
        <EmojiGrid socket={socket} name={name} allowPlayback={showControls} />
      </div>
    );
  } else {
    content = <h1>Please wait...</h1>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

        {content}
      </header>

      {error ? <div className="error">{error}</div> : null}
    </div>
  );
}

const styles = {
  input: {
    fontSize: "xxx-large",
    height: "100px",
    marginBottom: "20px",
    width: "75%",
    textAlign: "center",
  },
  confirmButton: {
    fontSize: "xxx-large",
    height: "100px",
    width: "75%",
  },
  grid: {
    display: "flex",
    flexDirection: "column",
    gap: "50px",
  },
  posters: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
  },
  posterButtonContainer: {
    position: "relative",
  },
  posterButton: {
    background: "none",
    border: "none",
  },
  selectedPosterButton: {
    scale: "1.1",
  },
  disabledPoster: {
    opacity: "0.5",
  },
  posterCheckmark: {
    position: "absolute",
    fontSize: "36px",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 1,
  },
  poster: {
    width: "100%",
  },
  selector: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    gap: "20px",
  },
  button: {
    fontSize: "24px",
    padding: "20px",
    cursor: "pointer",
    borderRadius: "100%",
  },
};

export default App;
