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


// (async () => {
//     try {
//         const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
//         const page = await browser.newPage();
//         console.log('direct to the page...');
//         await page.goto('https://www.wine-searcher.com/find/vina+cobos+marchiori+malbec+perdriel+mendoza+argentina/1/hong+kong',{ waitUntil: 'load' });
//         const content = await page.content();
//         console.log('loaded...');
//         const $ = cheerio.load(content);
//         getWine($);
//         await browser.close();
//     } catch (err) {
//         console.log(err);
//     }
// })();
(async () => {
    try {
        const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        let page = await browser.newPage();
        let list = await read('/topCountry.json');
        console.log(list);
        await runThroughList(page, list);
        await browser.close();
    } catch (err) {
        console.log(err);
    }
})();

async function runThroughList(page, list) {
    for (let country in list) {
        await page.goto(list[country]);
        let links = await page.evaluate(() => {
            let links = document.querySelectorAll('.wine-suggest-link');
            return [].map.call(links, link => link.getAttribute("href"));
        });
        let nextPage = await page.evaluate(() => {
            let  = document.querySelector('a[title="Next page"]');
        });

        if (typeof nextPage !== 'undefined') {
            await page.goto(nextPage.getAttribute("href"));
        };
        console.log(links);
    }
}

function write(content) {
    return new Promise((resolve, reject) => {
        fs.writeFile(__dirname + "/topCountry.json", JSON.stringify(content), 'utf8', function (err) {
            if (err) { reject(err); };
            console.log("The file was saved!");
        });
    });
}

function read(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(__dirname + path, function read(err, data) {
            if (err) { reject(err); };
            resolve(JSON.parse(data));
        });
    });
}

function tidyUpValue(value) {
    return value
        .replace(/[\n]+/g, "")
        //.replace(/[\s]+/g, "")
        .replace(/^[\s]+/, "");
}

function tidyUpPorperty(property) {
    return property
        .toLowerCase()
        .replace(/[\n]+/g, "")
        .replace(/^[\s]+/, "")
        .replace(/[\s\/]/g, "_");
}

function getWine($) {
    let wine = {};
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
            wine[property] = [];
            $el.children('div.smallish').each((idx, el) => {
                let $el = $(el);
                wine[property].push($el.text());
            });
        } else if ($el.has('b').length > 0) {
            wine[property] = tidyUpValue($el.children('b').text());
        } else if ($el.has('.sidepanel-text').length > 0) {
            wine[property] = tidyUpValue($el.children('.sidepanel-text').text());
        } else if ($el.has('a').length > 0) {
            wine[property] = tidyUpValue($el.children('a').text());
        } else if ($el.has('div').length > 0) {
            wine[property] = tidyUpValue($el.children('div').text());
        }
    });
    console.log(wine);
}