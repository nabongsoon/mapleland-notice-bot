const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");

const webhook = process.env.DISCORD_WEBHOOK;

async function main() {
  const res = await axios.get("https://maple.land/board/notices");
  const $ = cheerio.load(res.data);

  let latest = null;

  // 공지 링크를 순서대로 확인
  $("a[href^='/board/notices/']").each((_, el) => {
    const id = $(el).attr("href");
    const title = $(el).text().trim();

    // 제목이 없는 건 건너뜀
    if (!title) return;

    // 고정 공지는 건너뜀
    if (title.includes("서비스 일시중단 안내")) return;

    latest = { id, title };

    // 첫 번째 일반 공지만 사용
    return false;
  });

  if (!latest) {
    console.log("notice parse failed");
    return;
  }

  let last = "";

  try {
    last = fs.readFileSync("last.json", "utf8").trim();
  } catch (e) {}

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
