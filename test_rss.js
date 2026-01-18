
const fetch = require('node-fetch');
const { DOMParser } = require('xmldom');

async function test() {
    const url = "https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja";
    const res = await fetch(url);
    const text = await res.text();
    console.log(text.substring(0, 5000));
}
test();
