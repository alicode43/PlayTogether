"use client";

import { createContext, useState, useEffect } from "react";
import socket from "../utils/socketClient";

export const MediaContext = createContext();

export const MediaProvider = ({ children }) => {
  const [mediaList, setMediaList] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      socket.on("media-list", (list) => setMediaList(list));
      socket.on("new-media", (media) => setMediaList((prev) => [...prev, media]));

      return () => {
        socket.off("media-list");
        socket.off("new-media");
      };
    }
  }, []);

  return (
    <MediaContext.Provider value={{ mediaList, socket }}>
      {children}
    </MediaContext.Provider>
  );
};
