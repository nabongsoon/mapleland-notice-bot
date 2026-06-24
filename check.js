const fs = require("fs");
const axios = require("axios");

const webhook = process.env.DISCORD_WEBHOOK;

async function main() {

  const res = await axios.get("https://maple.land/board/notices");
  const html = res.data;

  const match = html.match(
    /href="(\/board\/notices\/[^"]+)">([^<]+)<\/a>/
  );

  if (!match) return;

  const url = match[1];
  const title = match[2];

  // 🔥 안정적인 중복 방지 키 (URL + 제목)
  const id = url + "|" + title;

  let last = "";

  if (fs.existsSync("last.json")) {
    last = fs.readFileSync("last.json", "utf-8");
  }

  if (last === id) {
    console.log("no new notice");
    return;
  }

  console.log("new notice:", title);

  await axios.post(webhook, {
    content: `📢 ${title}\nhttps://maple.land${url}`
  });

  fs.writeFileSync("last.json", id);
}

main();
