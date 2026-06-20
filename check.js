const axios = require("axios");
const fs = require("fs");

const webhook = process.env.DISCORD_WEBHOOK;

async function main() {
  const response = await axios.get(
    "https://maple.land/board/notices"
  );

  const html = response.data;

  const matches = [
    ...html.matchAll(
      /href="(\/board\/notices\/[^"]+)">([^<]+)</g
    )
  ];

  if (matches.length === 0) {
    console.log("공지 찾기 실패");
    return;
  }

  const notices = matches.map(m => ({
    url: "https://maple.land" + m[1],
    title: m[2].trim()
  }));

  console.log("찾은 공지 수:", notices.length);

  let knownNotices = [];

  if (fs.existsSync("known_notices.txt")) {
    knownNotices = fs
      .readFileSync("known_notices.txt", "utf8")
      .split("\n")
      .filter(Boolean);
  }

  const currentIds = notices.map(
    n => `${n.title}|${n.url}`
  );

  const newNotices = notices.filter(
    n => !knownNotices.includes(
      `${n.title}|${n.url}`
    )
  );

  if (newNotices.length === 0) {
    console.log("새 공지 없음");
    return;
  }

  console.log(
    `새 공지 ${newNotices.length}개 발견`
  );

  // 오래된 것부터 전송
  newNotices.reverse();

  for (const notice of newNotices) {
    await axios.post(webhook, {
      content:
`📢 메이플랜드 새 공지

${notice.title}

${notice.url}`
    });
  }

  fs.writeFileSync(
    "known_notices.txt",
    currentIds.join("\n")
  );

  console.log("공지 전송 완료");
}

main().catch(console.error);
