// GET /api/status
//
// The page's headline is "Everything here is in production". This is the
// proof, checked live: every project is fetched from here and timed, and the
// page lights each one up with what came back. Cached at Vercel's edge for a
// minute, so however many people visit, each site is asked at most once a
// minute.

const SITES = [
  'https://desitotes.com',
  'https://amgprojectsllp.com',
  'https://ai-compiler-eta.vercel.app',
  'https://ai-chat-bot-gcar.vercel.app',
  'https://gamifyport.vercel.app',
];

async function check(url) {
  const started = Date.now();
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(6000),
      headers: { 'user-agent': 'portfolio-status (+https://portfolio-q38w.vercel.app)' },
    });
    const ms = Date.now() - started;      // time to first byte of the response
    res.body?.cancel?.();                 // the status is the answer; skip the page
    return { host: new URL(url).host, up: res.ok, code: res.status, ms };
  } catch {
    return { host: new URL(url).host, up: false, code: 0, ms: Date.now() - started };
  }
}

module.exports = async (req, res) => {
  const sites = await Promise.all(SITES.map(check));
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  res.status(200).json({ checked: new Date().toISOString(), sites });
};

module.exports.check = check;
