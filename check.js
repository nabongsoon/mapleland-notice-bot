const axios = require("axios");
const fs = require("fs");

const WEBHOOK = process.env.DISCORD_WEBHOOK;
const URL = "https://maple.land/board/notices";
const FILE = "last.json";

function loadLast() {
  if (!fs.existsSync(FILE)) return [];
  return JSON.parse(fs.readFileSync(FILE));
}

function saveLast(data) {
  fs.writeFileSync(FILE, JSON.stringify(data));
}

async function send(title, link) {
  await axios.post(WEBHOOK, {
    content: `📢 새 공지\n${title}\nhttps://maple.land${link}`
  });
}

async function main() {
  const res = await axios.get(URL);
  const html = res.data;

  const matches = [...html.matchAll(/href="(\/board\/notices\/[^"]+)">([^<]+)</g)];

  const posts = matches.map(m => ({
    href: m[1],
    title: m[2]
  }));

  const last = loadLast();

  const newPosts = posts.filter(
    p => !last.find(l => l.href === p.href)
  );

  if (newPosts.length > 0) {
    for (const p of newPosts.reverse()) {
      await send(p.title, p.href);
    }
    saveLast(posts);
  }

  console.log("완료");
}

main();
