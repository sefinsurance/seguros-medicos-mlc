export const prerender = true;

// Minimal RSS endpoint to avoid build failures if @astrojs/rss isn't installed.
// If you later want a real feed, install @astrojs/rss and replace this file.
export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>Obamacare Local</title>\n    <link>https://obamacarelocal.com/</link>\n    <description>Updates and resources from Obamacare Local.</description>\n  </channel>\n</rss>\n`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
