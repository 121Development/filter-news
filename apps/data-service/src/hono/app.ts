import { Hono } from 'hono';
import { XMLParser } from 'fast-xml-parser';

async function generateHash(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

const hashMapItems = new Map<string, any>();

function checkAndAddItem(hash: string, item: any): boolean {
    if (hashMapItems.has(hash)) {
        console.log(`Item with hash ${hash} already exists, skipping...`);
        return false;
    }
    hashMapItems.set(hash, item);
    console.log(`Added item with hash ${hash} to map`);
    return true;
}

export const App = new Hono<{ Bindings: Env }>();

App.get('/:id', async (c) => {
    
    return c.json({
        message: 'Hello World!'
    })
})

App.get('/do/aftonbladet', async (c) => {
    console.log("[MANUAL PARSE RSS FEED] ");

    const response = await fetch('https://rss.aftonbladet.se/rss2/small/pages/sections/senastenytt/');
    const xmlData = await response.text();

    const parser = new XMLParser();
    const result = parser.parse(xmlData);

    const items = result?.rss?.channel?.item;

    if (items && items.length > 0) {
        const processedItems = await Promise.all(
            items.slice(0, 5).map(async (item: any) => {
                const title = item?.title || '';
                const link = item?.link?.replace('?utm_medium=rss', '') || '';
                const hash = await generateHash(title + link);

                return {
                    title,
                    link,
                    pubDate: item?.pubDate,
                    description: item?.description,
                    hash
                };
            })
        );

        const newItems = processedItems.filter((item: any) => {
            return checkAndAddItem(item.hash, item);
        });

        console.log("Parsed 5 items:");
        newItems.forEach((item: any, index: number) => {
            console.log(`\nItem ${index + 1}:`);
            console.log("Title:", item.title);
            console.log("Link:", item.link);
            console.log("Pub date:", item.pubDate);
            console.log("Description:", item.description);
            console.log("Hash:", item.hash);
        });

        return c.json({
            message: 'RSS Feed parsed successfully',
            items: newItems,
            newItemsCount: newItems.length,
            totalItems: items.length,
            totalInMap: hashMapItems.size
        });
    }

    return c.json({
        message: 'RSS Feed parsed but no items found'
    });
})