const fs = require("fs");
const axios = require("axios");

const webhook = process.env.DISCORD_WEBHOOK;

async function main() {

  const res = await axios.get("https://maple.land/board/notices");
  const html = res.data;

  const matches = [...html.matchAll(
    /href="(\/board\/notices\/[^"]+)">([^<]+)<\/a>/g
  )];

  if (matches.length === 0) return;

  // 🔥 최신 공지 1개만 가져오기
  const latest = {
    id: matches[0][1],
    title: matches[0][2]
  };

  let last = "";

  try {
    last = fs.readFileSync("last.json", "utf-8");
  } catch (e) {
    last = "";
  }

  // 🔥 이미 처리한 거면 종료
  if (last === latest.id) {
    console.log("no new notice");
    return;
  }

  console.log("new notice:", latest.title);

  await axios.post(webhook, {
    content: `📢 ${latest.title}\nhttps://maple.land${latest.id}`
  });

  fs.writeFileSync("last.json", latest.id);
}

main();
