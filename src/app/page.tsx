"use client";

import { useState, ChangeEvent } from "react";
import React from "react";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export default function HomePage() {
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [generatedLink, setGeneratedLink] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleGenerateLink = async (): Promise<void> => {
    try {
      const response = await fetch(`${BACKEND_URL}/generate-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: { sessionId?: string } = await response.json();
      console.log(data);
      if (data.sessionId) {
        const currentUrl = window.location.origin;
        setGeneratedLink(`${currentUrl}/view/${data.sessionId}`);
        setErrorMessage(""); 
      }
    } catch (error) {
      console.log("Error generating link:", error);
      setErrorMessage("Failed to generate link. Please try again later.");
    }
  };

  return (
    <div>
      <h1>Enter YouTube Video URL to see</h1>
      <input
        type="text"
        value={videoUrl}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setVideoUrl(e.target.value)}
        placeholder="Paste YouTube URL here"
      />
      <button onClick={handleGenerateLink}>Generate Telecast Link</button>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {generatedLink && (
        <div>
          <p>Share this link:</p>
          <a href={generatedLink}>{generatedLink}</a>
        </div>
      )}
    </div>
  );
}
