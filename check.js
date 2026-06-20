const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const webhook = process.env.DISCORD_WEBHOOK;

async function main() {

  const response = await axios.get(
    "https://maple.land/board/notices"
  );

const html = response.data;

console.log(html.substring(0, 3000));

const match = html.match(/\/board\/notices\/[0-9]+/);

  if (!match) {
    console.log("공지 찾기 실패");
    return;
  }

  const noticeUrl =
    "https://maple.land" + match[0];

  let lastNotice = "";

  if (fs.existsSync("last_notice.txt")) {
    lastNotice = fs.readFileSync(
      "last_notice.txt",
      "utf8"
    );
  }

  if (noticeUrl === lastNotice) {
    console.log("새 공지 없음");
    return;
  }

  await axios.post(webhook, {
    content:
      `📢 메이플랜드 새 공지\n${noticeUrl}`
  });

  fs.writeFileSync(
    "last_notice.txt",
    noticeUrl
  );

  console.log("새 공지 전송 완료");
}

main().catch(console.error);
