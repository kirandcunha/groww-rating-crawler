const axios = require('axios');
const cheerio = require('cheerio');
const growBase = "https://groww.in";
const growStocks = growBase + "/stocks/filter?page=";
const TOTAL_PAGES = 292;
const START_PAGE = 0;
const delayTime = 1000;
const MIN_RATING = 90;
const MAX_RATING = 101;
const ENABLE_LOGS = false

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function fetchWebsiteData(url, page) {
  if (ENABLE_LOGS) {
    console.log("Crawling data...")
  }
  // make http call to url
  let response = await axios(url).catch(() => console.log("Error occurred while fetching data", url, page));

  if (response?.status !== 200) {
    return;
  }
  response.page = page
  return response;
}

function fetchRating(url, page) {
  if (ENABLE_LOGS) {
    console.log("fetchRating:", url)
  }
  fetchWebsiteData(url, page).then((res) => {
    if (res?.data) {
      const html = res.data;
      const $ = cheerio.load(html);
      const stock = $('.lpu38Head.truncate').text()
      //const page = $('.pg1231Box.bodyRegular16.pg1231Selected');
      //console.log("page:", page.text())
      // const ratingText = $('.expertsRating_buyDiv__INdls.pos-rel.absolute-center').get(1);
      const ratingText = $('.expertsRating_buyDiv__INdls span').get(0);
      if (ENABLE_LOGS) {
        // console.log("ratingText:", ratingText)
      }
      const rating = Number($(ratingText).text().substring(0, 2))
      if (!isNaN(rating)) {
        if (rating >= MIN_RATING && rating < MAX_RATING) {
          console.log(url + "," + stock + "," + rating)
        } else {
          if (ENABLE_LOGS) {
            console.log("Not selected," + url + "," + stock + "," + rating)
          }
        }
      }
    }
  }).catch((err) => {
    console.error("Cannot fetch url : ", url);
    if (ENABLE_LOGS) {
      console.error(err)
    }
  })
}
async function start(url) {
  for (let i = START_PAGE; i < TOTAL_PAGES; i++) {
    await delay(delayTime)
    fetchWebsiteData(url + i, i).then((res) => {
      const html = res.data;
      const $ = cheerio.load(html);
      const statsTable = $('.cur-po.contentPrimary');
      statsTable.each(function() {
        fetchRating(growBase + $(this).attr("href"), res.page)
      });
    }).catch(() => {
      console.error("Cannot fetch page : ", i);
    })
  }
}
start(growStocks)
