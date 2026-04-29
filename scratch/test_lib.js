const { instagramGetUrl } = require('instagram-url-direct');

async function test() {
    try {
        let links = await instagramGetUrl('https://www.instagram.com/reels/DUh6_TnkbmB/');
        console.log(JSON.stringify(links, null, 2));
    } catch (e) {
        console.error(e);
    }
}
test();
