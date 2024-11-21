"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io(process.env.BACKEND_URL || "http://localhost:4000");

export default function ViewerPage({ params }) {
  const [sessionId, setSessionId] = useState(null);
  const playerRef = useRef(null);
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    params.then(resolvedParams => {
      setSessionId(resolvedParams.sessionId);
    });
  }, [params]);

  useEffect(() => {
    if (!sessionId) return;

    // Join session and listen for updates
    socket.emit("join-session", { sessionId });

    socket.on("init", (session) => {
      setVideoUrl(session.videoUrl);
      if (session.currentTime) {
        playerRef.current?.seekTo(session.currentTime);
      }
    });

    socket.on("play", () => {
      playerRef.current?.playVideo();
    });

    socket.on("pause", () => {
      playerRef.current?.pauseVideo();
    });

    socket.on("seek", (time) => {
      playerRef.current?.seekTo(time);
    });

    return () => {
      socket.disconnect();
    };
  }, [sessionId]);

  useEffect(() => {
    const onYouTubeIframeAPIReady = () => {
      let videoId = "";
      try {
        videoId = new URLSearchParams(new URL(videoUrl).search).get("v");
      } catch (error) {
        console.error("Invalid video URL", error);
      }
      playerRef.current = new YT.Player("player", {
        videoId,
        playerVars: { controls: 0 },
        events: {
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING) {
              socket.emit("play", { sessionId });
            } else if (event.data === YT.PlayerState.PAUSED) {
              socket.emit("pause", { sessionId });
            }
          },
          onPlaybackQualityChange: () => {},
          onPlaybackRateChange: () => {},
          onError: () => {},
          onApiChange: () => {},
          onReady: (event) => {
            event.target.seekTo(0);
          },
        },
      });
    };

    if (window.YT) {
      onYouTubeIframeAPIReady();
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    }
  }, [videoUrl]);

  useEffect(() => {
    if (!sessionId) return;

    const handleTimeUpdate = () => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        const currentTime = playerRef.current.getCurrentTime();
        socket.emit("seek", { sessionId, currentTime });
      }
    };

    const interval = setInterval(handleTimeUpdate, 1000);

    return () => clearInterval(interval);
  }, [sessionId]);

  return <>

<div id="player" />;
  </> 
}
