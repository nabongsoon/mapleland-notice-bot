const axios = require("axios");

async function main() {
  const res = await axios.get("https://maple.land/board/notices");
  const html = res.data;

  const matches = [...html.matchAll(
    /href="(\/board\/notices\/[^"]+)">([^<]+)<\/a>/g
  )];

  console.log(
    matches.slice(0, 5).map(x => ({
      id: x[1],
      title: x[2]
    }))
  );
}

main();
