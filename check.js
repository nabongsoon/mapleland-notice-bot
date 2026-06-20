const axios = require("axios");
const fs = require("fs");

const webhook = process.env.DISCORD_WEBHOOK;

async function main() {

  const response = await axios.get(
    "https://maple.land/board/notices"
  );

  const html = response.data;

  const match = html.match(
    /href="(\/board\/notices\/[^"]+)">([^<]+)<\/a>/
  );

  if (!match) {
    console.log("공지 찾기 실패");
    return;
  }

  const noticeUrl =
    "https://maple.land" + match[1];

  const noticeTitle =
    match[2].trim();

  const currentNotice =
    `${noticeTitle}|${noticeUrl}`;

  let lastNotice = "";

  if (fs.existsSync("last_notice.txt")) {
    lastNotice = fs.readFileSync(
      "last_notice.txt",
      "utf8"
    );
  }

  if (currentNotice === lastNotice) {
    console.log("새 공지 없음");
    return;
  }

  await axios.post(webhook, {
    content:
`📢 메이플랜드 새 공지

${noticeTitle}

${noticeUrl}`
  });

  fs.writeFileSync(
    "last_notice.txt",
    currentNotice
  );

  console.log("새 공지 전송 완료");
}

main().catch(console.error);
