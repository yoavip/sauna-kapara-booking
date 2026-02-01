import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Crawler user agents to detect
const CRAWLER_PATTERNS = [
  'facebookexternalhit',
  'Facebot',
  'WhatsApp',
  'Twitterbot',
  'LinkedInBot',
  'Slackbot',
  'TelegramBot',
  'Discordbot',
  'Pinterest',
  'Googlebot',
  'bingbot',
];

function isCrawler(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return CRAWLER_PATTERNS.some(pattern => ua.includes(pattern.toLowerCase()));
}

// Snooker page metadata
const SNOOKER_META = {
  title: 'ביליארד בית קשת | השולחן הכי חם בצפון 🎱',
  description: 'הזמינו מקום בשולחן הביליארד של בית קשת. רדיו בר, אווירה מעולה, ומשחק שווה!',
  image: 'https://sauna-kapara-booking.lovable.app/snooker-og.jpg',
  url: 'https://sauna-kapara-booking.lovable.app/snooker',
};

// Default (sauna) page metadata
const DEFAULT_META = {
  title: 'סאונה בית קשת | הזמנת מקום בסאונה פינית בגליל',
  description: 'הזמינו מקום בסאונה הפינית של קיבוץ בית קשת. חוויית סאונה אותנטית בלב הטבע הגלילי.',
  image: 'https://lovable.dev/opengraph-image-p98pqg.png',
  url: 'https://sauna-kapara-booking.lovable.app/',
};

function generateHTML(meta: typeof SNOOKER_META): string {
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${meta.title}</title>
  <meta name="description" content="${meta.description}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${meta.title}">
  <meta property="og:description" content="${meta.description}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="${meta.image}">
  <meta property="og:url" content="${meta.url}">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${meta.title}">
  <meta name="twitter:description" content="${meta.description}">
  <meta name="twitter:image" content="${meta.image}">
  
  <!-- Redirect for browsers -->
  <meta http-equiv="refresh" content="0; url=${meta.url}">
  <link rel="canonical" href="${meta.url}">
</head>
<body>
  <p>Redirecting to <a href="${meta.url}">${meta.title}</a>...</p>
</body>
</html>`;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const userAgent = req.headers.get('user-agent') || '';
    const path = url.searchParams.get('path') || '/';
    
    console.log(`OG Proxy request - Path: ${path}, UA: ${userAgent.substring(0, 100)}`);
    
    // Only respond with HTML for crawlers
    if (!isCrawler(userAgent)) {
      // For regular users, return a redirect
      const redirectUrl = path.includes('snooker') 
        ? SNOOKER_META.url 
        : DEFAULT_META.url;
      
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': redirectUrl,
        },
      });
    }

    // Determine which metadata to use based on path
    const isSnooker = path.includes('snooker');
    const meta = isSnooker ? SNOOKER_META : DEFAULT_META;
    
    console.log(`Serving ${isSnooker ? 'snooker' : 'default'} metadata to crawler`);
    
    const html = generateHTML(meta);
    
    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('OG Proxy error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
