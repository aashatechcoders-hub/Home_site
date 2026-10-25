// Notifies Bing (which powers ChatGPT search and Copilot), Yandex, Seznam and
// other IndexNow engines that every URL in the live sitemap has changed.
// Run after each deploy: npm run indexnow
const HOST = 'aashatechcoders.in';
const KEY = 'd791225c152630956d9b5d4e63c473a7'; // must match public/d791225c152630956d9b5d4e63c473a7.txt

const sitemap = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!urlList.length) throw new Error('No URLs found in the live sitemap — deploy first.');

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
});
console.log(`IndexNow: HTTP ${res.status} for ${urlList.length} URLs`);
if (!res.ok && res.status !== 202) process.exit(1);
