
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid"; // To generate unique session IDs

export async function POST(request) {
  try {
    const { videoUrl } = await request.json();

    // Validate the YouTube URL (basic validation)
    if (!videoUrl || !videoUrl.includes("youtube.com/watch?v=")) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    const sessionId = uuidv4(); // Generate a unique session ID
    const session = {
      sessionId,
      videoUrl,
      state: "paused", // Default state of the video
    };

    console.log(session);
    // Optionally, you can store the session in a database or in memory.
    // For now, just send it in the response.
    return NextResponse.json({ sessionId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate session link" }, { status: 500 });
  }
}
