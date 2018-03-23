const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs');
const delay = require('./timeoutRandomizer');

(async () => {
    try {
        const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        let page = await browser.newPage();
        let list = await read('/topCountry.json');
        console.log('finished file reading...');
        await getAllTopWine(page, list);
        await browser.close();
    } catch (err) {
        console.log(err);
    }
})();

async function getCountryList() {
    let topCountry = {};
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto('https://www.wine-searcher.com/regions.lml');
    const content = await page.content();
    const $ = cheerio.load(content);
    $('div#navigation ul.top-level li a').each(function (idx, el) {
        var $el = $(el);
        topCountry[$el.text()] = $el.attr('href');
    });
    write(topCountry, "/topCountry.json");
    await browser.close();
}

async function startScrapy(page, wineCollection) {
    let collection = [];
    for (let country in wineCollection) {
        for (link of wineCollection[country]) {
            await page.goto(link);
            let content = await page.content();
            const $ = cheerio.load(content);
            collection.push(getWine($));
        }
    }
}

async function getAllTopWine(page, list) {
    let topWines = await read('/allWine.json');
    for (let country in list) {

        if (!topWines[country]) {

            let collectionLocal = [];
            let nextPage = true;
            console.log('directing to ' + country + '...');
            await delay([40000, 120000]);
            await page.goto(list[country]);
            console.log('directed to ' + country + '...');
            await page.screenshot({
                path: 'screenshot.jpg'
            });

            do {
                let links = await GetWineLinks(page);
                console.log('The first link is ', links);
                collectionLocal = collectionLocal.concat(links);
                if (await GetNextPage(page)) {
                    console.log('detected next page');
                    await delay([40000, 120000]);
                    await page.goto(await GetNextPage(page));
                    console.log('direct to next page');
                } else {
                    nextPage = false;
                }
            } while (nextPage);

            topWines[country] = collectionLocal;
            console.log('writing file...');
            await write(topWines, `/allWine.json`);
        }
    }
    return console.log('all done!');
}

async function GetWineLinks(page) {
    let links = await page.evaluate(() => {
        let links = document.querySelectorAll('.wine-suggest-link');
        return [].map.call(links, link => link.getAttribute("href"));
    });

    return links;
}

async function GetNextPage(page) {
    return await page.evaluate(() => {
        let link = document.querySelector('a[title="Next page"]');
        if (!link) {
            return link;
        }
        return link.getAttribute('href');
    });
}

function write(content, fileName) {
    return new Promise((resolve, reject) => {
        fs.writeFile(__dirname + fileName, JSON.stringify(content), { encoding: 'utf8', flag: 'w' }, function (err) {
            if (err) { reject(err); };
            resolve(console.log("The file was saved!"));
        });
    });
}

function read(path) {
    console.log('reading ' + path + '...');
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
    return wine;
}