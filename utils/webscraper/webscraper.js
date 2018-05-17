require('dotenv').config({ path: '../.env' });
const NODE_ENV = 'staging';
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs');
const delay = require('./timeoutRandomizer');
const knexFile = require('../knexfile')[NODE_ENV];
const knex = require('knex')(knexFile);
const wineProperty = ['wine_name','picture','country','producer','notes','average_user_rating','region_appellation_country_hierarchy','grape_blend','food_suggestion','wine_style','alcohol_content','awards'];

(async () => {
    try {
        const browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });        
        let page = await browser.newPage();
        // let list = await read('/topCountry.json');
        let wineCollection = await read('/allWine.json');
        console.log('finished file reading...');
        // await getAllTopWine(page, list);
        await startScrapy(page, wineCollection);
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
    const progress = await read('/progress.json');

    for (let country in wineCollection) {
        if (progress[country] !== 'done') {
            let counter = progress[country] || 0
            let currentCounter = 0;
            for (link of wineCollection[country]) {
                if (currentCounter >= counter && currentCounter <= 100) {
                    
                    await delay([40000, 100000]);
                    await page.goto(link);
                    let content = await page.content();
                    await page.screenshot({
                        path: 'progress.jpg'
                    });
                    const $ = cheerio.load(content);
                    const wine = getWine($, country);
                    await writeInDataBase(wine);
                    currentCounter++;
                    progress[country] = currentCounter;
                    console.log('saving progress');
                    await write(progress, '/progress.json');
                } else {
                    console.log('this wine is already written in DB');
                    currentCounter++;
                }
            }
            console.log('finished a country');
            progress[country] = 'done';
            await write(progress, '/progress.json');
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
        .replace(/[\s]+$/, "")
        .replace(/[\s\/]/g, "_");
}

function getWine($, country) {
    let wine = {};
    wine['picture'] = $('.wine-info-panel #imgThumbDiv #thumb_img img').attr('src');
    wine['wine_name'] = $('#top_header span[itemprop="name"]').text();
    wine['country'] = country;
    let wineInfo = $('.wine-info-panel .dtc .dtlbl');

    wineInfo.each((idx, el) => {
        let $el = $(el);
        let property = tidyUpPorperty($el.clone().children().remove().end().text());

        if (!(wineProperty.some((e)=> e === property))) {
            return;
        } else if (property === 'average_user_rating') {
            wine[property] = $el.children('span.goldstar').length;
        } else if (property === 'region_appellation_country_hierarchy') {
            let region = $el.children('a').text().split('\n').map(e => e.replace(/\,/g, "")).filter(e => e!=="");
            console.log(region);
            if (region.length === 1) {
                wine.country_hierarchy = region[0];
            } else {
                wine.region_appellation = region.splice(0,1)[0];
                wine.country_hierarchy = region.join(',');
            }
        } else if ($el.has('div.smallish').length > 0) {
            wine[property] = {};
            $el.children('div.smallish').each((idx, el) => {
                let $el = $(el);
                let award = $el.text().split(':')
                wine[property][award[0]] = award[1];
            });
            wine[property] = JSON.stringify(wine[property]);
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
    if (wine.wine_name === '') {
        console.log(wine);
        throw new Error('Being blocked');
    }
    console.log(wine.wine_name);
    return wine;
}

function writeInDataBase(relation) {
    knex('wines').insert(relation)
        .then(() => console.log('written into DB'))
        .catch((err) => console.log(err));
}

// (async () => {
//     try {
//         const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
//         let page = await browser.newPage();
//         await page.goto('https://www.wine-searcher.com/find/catena+zapata+malbec+mendoza+argentina/1/hong+kong');
//         let content = await page.content();
//         const $ = cheerio.load(content);
//         let wine = getWine($);
//         writeInDataBase(wine);
//         await browser.close();
//     } catch (err) {
//         console.log(err);
//     }
// })();