const axios = require("axios");

const webhook = process.env.DISCORD_WEBHOOK;

async function main() {
  const page = await axios.get(
    "https://maple.land/board/notices"
  );

  await axios.post(webhook, {
    content: "테스트 성공!"
  });
}

main();
