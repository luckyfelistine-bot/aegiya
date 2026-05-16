import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    const contentType = response.headers.get("content-type") || "text/html";
    let html = await response.text();

    if (contentType.includes("text/html")) {
      html = html.replace(
        /<head>/i,
        `<head><base href="${url}" /><meta name="referrer" content="no-referrer">`
      );
      html = html.replace(/if\s*\(\s*top\s*!==\s*self\s*\)[\s\S]*?}/gi, "");
    }

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch proxy target" }, { status: 500 });
  }
}
