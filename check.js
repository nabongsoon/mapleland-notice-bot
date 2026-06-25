const axios = require("axios");

async function main() {
  const res = await axios.get("https://maple.land/board/notices");
  const html = res.data;

  const matches = [...html.matchAll(/\/board\/notices\/[^"]+/g)];

  console.log(
    matches.slice(0, 20).map(x => x[0])
  );
}

main();
