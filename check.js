const fs = require("fs");
const axios = require("axios");

const webhook = process.env.DISCORD_WEBHOOK;

async function main() {

  const res = await axios.get("https://maple.land/board/notices");
  const html = res.data;

  // 🔥 모든 공지 다 가져오기
  const matches = [...html.matchAll(
    /href="(\/board\/notices\/[^"]+)">([^<]+)<\/a>/g
  )];

  if (matches.length === 0) return;

  const notices = matches.map(m => ({
    url: m[1],
    title: m[2],
    id: m[1] // URL만 기준으로 사용
  }));

  let last = "";

  if (fs.existsSync("last.json")) {
    last = fs.readFileSync("last.json", "utf-8");
  }

  const latest = notices[0];

  if (latest.id === last) {
    console.log("no new notice");
    return;
  }

  console.log("new notice:", latest.title);

  await axios.post(webhook, {
    content: `📢 ${latest.title}\nhttps://maple.land${latest.url}`
  });

  fs.writeFileSync("last.json", latest.id);
}

main();
