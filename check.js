const fs = require("fs");
const axios = require("axios");

const webhook = process.env.DISCORD_WEBHOOK;

async function main() {
  const res = await axios.get("https://maple.land/board/notices");
  const html = res.data;

  const matches = [...html.matchAll(
    /href="(\/board\/notices\/[^"]+)">([^<]+)<\/a>/g
  )];

  if (matches.length < 2) {
    console.log("notice parse failed");
    return;
  }

  // 첫 번째는 고정공지라 두 번째를 최신 공지로 사용
  const latest = {
    id: matches[1][1],
    title: matches[1][2]
  };

  let last = "";

  try {
    last = fs.readFileSync("last.json", "utf-8").trim();
  } catch (e) {
    last = "";
  }

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

main().catch(console.error);
