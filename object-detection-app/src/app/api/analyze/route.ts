import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { video_url, video_id } = await request.json();
    if (!video_url || !video_id) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    console.log("Starting analysis for video:", video_id, "URL:", video_url);

    // AI推論
    const apiUrl = process.env.AI_INFERENCE_API;
    if (!apiUrl) {
      return NextResponse.json(
        { error: "AI_INFERENCE_API is not configured" },
        { status: 500 }
      );
    }
    const inferenceResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ video_id, video_url }),
    });

    if (!inferenceResponse.ok) {
      const text = await inferenceResponse.text();
      console.error("AI API error:", text);
      return NextResponse.json({ error: "AI inference failed" }, { status: 502 });
    }

    const result = await inferenceResponse.json();
    console.log("AI inference started:", result);

    return NextResponse.json(
      {
        status: "processing started",
        video_id,
      },
      { status: 202 } // 202 Accepted: 非同期処理が開始された
    );

  } catch (err: any) {
    console.error("Error in /api/analyze:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
