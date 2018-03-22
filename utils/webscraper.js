const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs');
let topCountry = {};

// (async () => {
//     const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
//     const page = await browser.newPage();
//     await page.goto('https://www.wine-searcher.com/regions.lml');
//     const content = await page.content();
//     const $ = cheerio.load(content);
//     $('div#navigation ul.top-level li a').each(function (idx, el) {
//         var $el = $(el);
//         topCountry[$el.text()] = $el.attr('href');
//     });
//     write(topCountry);
//     await browser.close();
// })();

function write(content) {
    fs.writeFile(__dirname + "/topCountry.json", JSON.stringify(content), 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
}

async function read(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(__dirname + path, function read(err, data) {
            if (err) { reject(err); };
            // console.log(JSON.parse(data));
            resolve(JSON.parse(data));
        });
    });
}

// read("/topCountry.json")
//     .then(data => {
//         for(let prop in data) {
//             console.log(prop, ":", data[prop]);
//         }
//     });

(async () => {
    try {

        const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        const page = await browser.newPage();
        console.log('direct to the page...');
        await page.goto('https://www.wine-searcher.com/find/vina+cobos+marchiori+malbec+perdriel+mendoza+argentina/1/hong+kong');
        const content = await page.content();
        console.log('loaded...');
        const $ = cheerio.load(content);
        let wine = {};
        // console.log($('div.wine-info-panel').children('div[id="imgThumbDiv"]').children('div[id="thumb_img"]').children('a').children('img').attr('src'));
        wine['picture'] = $('.wine-info-panel #imgThumbDiv #thumb_img img').attr('src');
        let wineInfo = $('.wine-info-panel .dtc .dtlbl');
        
        wineInfo.each((idx, el) => {
            let $el = $(el);
            let property = tidyUpPorperty($el.clone().children().remove().end().text());
            if (property === '_') {
                return;
            } else if (property === 'average_user_rating') {
                wine[property] = $el.children('span.goldstar').length;
            } else if ($el.has('div.smallish').length > 0) {
                // console.log(property, ' caught in .smallish');
                wine[property] = [];
                $el.children('div.smallish').each((idx, el) => {
                    let $el = $(el);
                    wine[property].push($el.text());
                });
            } else if ($el.has('b').length > 0) {
                // console.log(property, ' caught in a');
                wine[property] = tidyUpValue($el.children('b').text());
            } else if ($el.has('.sidepanel-text').length > 0) {
                // console.log(property, ' caught in side-text');
                wine[property] = tidyUpValue($el.children('.sidepanel-text').text());
            } else if ($el.has('a').length > 0) {
                // console.log(property, ' caught in a');
                wine[property] = tidyUpValue($el.children('a').text());
            } else if ($el.has('div').length > 0) {
                // console.log(property, ' caught in div');
                wine[property] = tidyUpValue($el.children('div').text());
            }
        });
        
        console.log(wine);
        await browser.close();

    } catch (err) {
        console.log(err);
    }
})();

function tidyUpValue(value) {
    return value.replace(/\n/g, " ").replace(/[\s]+$/, '').replace(/^[\s]+/, '');
}

function tidyUpPorperty(property) {
    return property.toLowerCase().replace(/\n/g, "").replace(/[\s]+$/, '').replace(/[\s\/]/g, '_');
}
