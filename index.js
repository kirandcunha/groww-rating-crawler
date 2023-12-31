

const axios = require('axios');
const cheerio = require('cheerio');
const growBase = "https://groww.in";
const growStocks = growBase + "/stocks/filter?page=";
const TOTAL_PAGES = 284;
const START_PAGE = 0;
const delayTime = 1000;
const MIN_RATING = 95;
const MAX_RATING = 101;

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
  
  
async function fetchWebsiteData(url, page){
    // console.log("Crawling data...")
    // make http call to url
    let response = await axios(url).catch((err) => console.log(err));

    if(response?.status !== 200){
        console.log("Error occurred while fetching data");
        return;
    }
    response.page = page
    return response;
}
function fetchRating(url, page) {
    // console.log("fetchRating:", url)
    fetchWebsiteData(url, page).then( (res) => {
	if (res?.data) {
        const html = res.data;
        const $ = cheerio.load(html);
        const stock = $('.lpu38Head.truncate.display24').text()
        //const page = $('.pg1231Box.bodyRegular16.pg1231Selected');
	//console.log("page:", page.text())
        const ratingText = $('.exr42mainDiv.valign-wrapper .row.valign-wrapper.contentSecondary .bodyRegular16').get(1);
        const rating =  $(ratingText).text().substring(0,2)
	if (rating >= MIN_RATING && rating < MAX_RATING) {
            console.log(url + " : " + stock + " : " + rating)
        }
	}
    }).catch((err) => {})
}
async function start(url) {
    for(let i = START_PAGE ; i < TOTAL_PAGES; i ++) {
        await delay(delayTime)
        fetchWebsiteData(url + i, i).then( (res) => {
            const html = res.data;
            const $ = cheerio.load(html);
            const statsTable = $('.cur-po.contentPrimary');
            statsTable.each(function() {
                fetchRating(growBase + $(this).attr("href"), res.page)
            });
        })
    }
}
start(growStocks)



