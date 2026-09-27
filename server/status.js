// The page's headline is "Everything here is in production". This is the
// proof, checked live: every project is fetched from the server and timed,
// and the page lights each one up with what came back.

export const SITES = [
  'https://desitotes.com',
  'https://amgprojectsllp.com',
  'https://ai-compiler-eta.vercel.app',
  'https://ai-chat-bot-gcar.vercel.app',
  'https://gamifyport.vercel.app',
];

export async function check(url) {
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

export async function checkAll() {
  return { checked: new Date().toISOString(), sites: await Promise.all(SITES.map(check)) };
}
