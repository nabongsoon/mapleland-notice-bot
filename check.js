const axios = require("axios");
const fs = require("fs");

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
    if (!WEBHOOK) {
      console.log("WEBHOOK 없음 (GitHub Secrets 확인 필요)");
      return;
    }

    await axios.post(WEBHOOK, {
      content: `📢 새 공지\n${title}\nhttps://maple.land${link}`
    });

    console.log("디스코드 전송 성공");
  } catch (e) {
    console.log("디스코드 에러:");
    console.log(e.response?.data || e.message);
  }
}

async function main() {
  try {
    const res = await axios.get(URL);
    const html = res.data;

    const matches = [...html.matchAll(/href="(\/board\/notices\/[^"]+)">([^<]+)</g)];

    const posts = matches.map(m => ({
      href: m[1],
      title: m[2]
    }));

    const last = loadLast();

    const newPosts = posts.filter(
      p => !last.find(l => l.href === p.href)
    );

    console.log("전체 글:", posts.length);
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
