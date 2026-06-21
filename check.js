const axios = require("axios");
const fs = require("fs");
const cheerio = require("cheerio");

const WEBHOOK = process.env.DISCORD_WEBHOOK;
const URL = "https://maple.land/board/notices";
const FILE = "last.json";

function loadLast() {
  try {
    if (!fs.existsSync(FILE)) return [];
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    return [];
  }
}

function saveLast(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function send(post) {
  try {
    await axios.post(WEBHOOK, {
      embeds: [
        {
          title: post.title,
          url: "https://maple.land" + post.href,
          description: "새 공지가 등록되었습니다.",
          color: 3447003
        }
      ]
    });

    console.log("전송:", post.title);
  } catch (e) {
    console.log("전송 실패:", e.response?.data || e.message);
  }
}

async function main() {
  console.log("봇 시작");

  const res = await axios.get(URL);
  const $ = cheerio.load(res.data);

  const posts = [];

  $("a").each((_, el) => {
    const href = $(el).attr("href");
    const title = $(el).text().trim();

    if (
      href &&
      href.includes("/board/notices/") &&
      title.length > 3
    ) {
      posts.push({
        id: href,
        href,
        title
      });
    }
  });

  console.log("읽은 공지 수:", posts.length);

  const last = loadLast();

  // ⭐ 처음 실행이면 저장만 함
  if (last.length === 0) {
    console.log("첫 실행 - 기존 공지 저장");

    saveLast(posts);

    return;
  }

  const newPosts = posts.filter(
    p => !last.some(l => l.id === p.id)
  );

  console.log("신규 공지:", newPosts.length);

  for (const post of newPosts.reverse()) {
    await send(post);

    // 디스코드 제한 방지
    await sleep(1000);
  }

  saveLast(posts);

  console.log("완료");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
