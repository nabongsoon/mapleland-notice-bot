const axios = require("axios");
const fs = require("fs");

const webhook = process.env.DISCORD_WEBHOOK;

async function main() {
  const response = await axios.get(
    "https://maple.land/board/notices"
  );

  const html = response.data;

  const matches = [
    ...html.matchAll(/href="(\/board\/notices\/[^"]+)"/g)
  ];

  console.log("찾은 공지 수:", matches.length);

  if (matches.length === 0) {
    console.log("공지 찾기 실패");
    return;
  }

  const noticePath = matches[0][1];
  const noticeUrl = "https://maple.land" + noticePath;

  console.log("최신 공지:", noticeUrl);

  const titleRegex = new RegExp(
    `href="${noticePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}">([^<]+)`
  );

  const titleMatch = html.match(titleRegex);

  const noticeTitle = titleMatch
    ? titleMatch[1].trim()
    : "제목 확인 실패";

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
