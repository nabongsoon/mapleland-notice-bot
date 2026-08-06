const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");

const webhook = process.env.DISCORD_WEBHOOK;

async function main() {
  const res = await axios.get("https://maple.land/board/notices");
  const $ = cheerio.load(res.data);

  let latest = null;

  $("tbody tr").each((_, tr) => {
    const row = $(tr);

    // 고정 공지는 보통 data-pin, notice, fixed 등의 클래스나 속성이 있음
    const cls = row.attr("class") || "";
    if (
      cls.includes("notice") ||
      cls.includes("fixed") ||
      cls.includes("pin")
    ) {
      return;
    }

    const link = row.find("a[href^='/board/notices/']").first();

    if (!link.length) return;

    latest = {
      id: link.attr("href"),
      title: link.text().trim()
    };

    return false;
  });

  if (!latest) {
    console.log("notice parse failed");
    return;
  }

  let last = "";

  try {
    last = fs.readFileSync("last.json", "utf8").trim();
  } catch {}

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
