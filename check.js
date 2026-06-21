const axios = require("axios");
const fs = require("fs");
const cheerio = require("cheerio");

const WEBHOOK = process.env.DISCORD_WEBHOOK;
const URL = "https://maple.land/board/notices";
const FILE = "last.json";

console.log("봇 시작됨");

function loadLast() {
  try {
    if (!fs.existsSync(FILE)) return [];
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch (e) {
    console.log("저장 파일 손상 → 초기화");
    return [];
  }
}

function saveLast(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

async function send(post) {
  try {
    if (!WEBHOOK) throw new Error("WEBHOOK 없음");

    await axios.post(WEBHOOK, {
      embeds: [
        {
          title: post.title,
          url: "https://maple.land" + post.href,
          color: 0x00b0f4,
          footer: { text: "maple.land notice bot" }
        }
      ]
    });

    console.log("전송:", post.title);
  } catch (e) {
    console.log("Discord 실패:", e.response?.data || e.message);
  }
}

async function fetchWithRetry(url, retry = 3) {
  for (let i = 0; i < retry; i++) {
    try {
      return await axios.get(url);
    } catch (e) {
      console.log(`재시도 ${i + 1}/${retry}`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  throw new Error("페이지 요청 실패");
}

async function main() {
  try {
    const res = await fetchWithRetry(URL);
    const $ = cheerio.load(res.data);

    const posts = [];

    $("a").each((_, el) => {
      const href = $(el).attr("href");
      const title = $(el).text().trim();

      if (href && href.includes("/board/notices/") && title.length > 3) {
        posts.push({
          id: href,   // 🔥 핵심: ID 기반
          href,
          title
        });
      }
    });

    const last = loadLast();

    const newPosts = posts.filter(
      p => !last.find(l => l.id === p.id)
    );

    console.log("전체:", posts.length);
    console.log("신규:", newPosts.length);

    for (const post of newPosts.reverse()) {
      await send(post);
    }

    if (newPosts.length > 0) {
      saveLast(posts);
    }

    console.log("완료");
  } catch (e) {
    console.log("전체 오류:", e.message);
  }
}

main();
