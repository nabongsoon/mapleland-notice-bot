const axios = require("axios");
const fs = require("fs");
const cheerio = require("cheerio");

const WEBHOOK = process.env.DISCORD_WEBHOOK;
const URL = "https://maple.land/board/notices";
const FILE = "last.json";

console.log("WEBHOOK 확인:", WEBHOOK);

function loadLast() {
  if (!fs.existsSync(FILE)) return [];
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

function saveLast(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

async function send(title, link) {
  try {
    if (!WEBHOOK) return;

    await axios.post(WEBHOOK, {
      content: `📢 새 공지\n${title}\nhttps://maple.land${link}`
    });

    console.log("전송 완료:", title);
  } catch (e) {
    console.log("디스코드 에러:", e.response?.data || e.message);
  }
}

async function main() {
  try {
    const res = await axios.get(URL);
    const $ = cheerio.load(res.data);

    const posts = [];

    // 👉 a 태그 전체를 안정적으로 탐색
    $("a").each((_, el) => {
      const href = $(el).attr("href");
      const title = $(el).text().trim();

      if (href && href.includes("/board/notices/") && title) {
        posts.push({
          href,
          title
        });
      }
    });

    const last = loadLast();

    const newPosts = posts.filter(
      p => !last.find(l => l.href === p.href)
    );

    console.log("전체:", posts.length);
    console.log("새 글:", newPosts.length);

    if (newPosts.length > 0) {
      for (const p of newPosts.reverse()) {
        await send(p.title, p.href);
      }
      saveLast(posts);
    }

    console.log("완료");
  } catch (e) {
    console.log("전체 오류:", e.message);
  }
}

main();
