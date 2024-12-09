const axios = require('axios');
const cheerio = require('cheerio');
const growBase = "https://groww.in";
const growStocks = growBase + "/stocks/filter?page=";
const ALLOW_DELAY = false;
const TOTAL_PAGES = 292;
const START_PAGE = 0;
const delayTime = 10;
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
async function fetchRating(url, page) {
	if (ENABLE_LOGS) {
		console.log("fetchRating:", url)
	}
	const res = await fetchWebsiteData(url, page)
	if (res?.data) {
		const html = res.data;
		const $ = cheerio.load(html);
		const stock = $('.lpu38Head.truncate').text()
		//const page = $('.pg1231Box.bodyRegular16.pg1231Selected');
		//console.log("page:", page.text())
		// const ratingText = $('.expertsRating_buyDiv__INdls.pos-rel.absolute-center').get(1);
		const ratingText = $('.expertsRating_buyDiv__INdls span').get(0);
		// console.log("priceText", priceText)
		if (ENABLE_LOGS) {
			// console.log("ratingText:", ratingText)
		}
		const rating = Number($(ratingText).text().replace("%", ""))
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
}
async function start(url) {
	for (let i = START_PAGE; i < TOTAL_PAGES; i++) {
		const res = await fetchWebsiteData(url + i, i);
		const html = res.data;
		const $ = cheerio.load(html);
		const statsTable = $('.cur-po.contentPrimary');
		for (let i = 0; i < statsTable.length; i++) {
			await fetchRating(growBase + statsTable[i].attribs.href)
		}
	}
}
start(growStocks)

// fetchRating("https://groww.in/stocks/raymond-ltd")
