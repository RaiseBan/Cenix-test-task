import puppeteer from 'puppeteer';
import { selectRegion } from './utils/region-selector';
import { extractProductData } from './utils/data-extractor';
import { saveProductData } from './utils/file-writer';

async function main() {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.error('Usage: npm run puppeteer <product_url> <region>');
        console.error(
            'Example: npm run puppeteer "https://www.vprok.ru/product/..." "Санкт-Петербург и область"'
        );
        process.exit(1);
    }

    const [productUrl, region] = args;

    console.log(`Parsing: ${productUrl}`);
    console.log(`Region: ${region}`);

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1920, height: 1080 },
    });

    try {
        const page = await browser.newPage();

        await page.goto(productUrl, { waitUntil: 'networkidle2' });

        const regionSelected = await selectRegion(page, region);

        if (!regionSelected) {
            console.error('Failed to select region. Exiting...');
            process.exit(1);
        }

        console.log('✓ Region selected');

        const productData = await extractProductData(page);
        console.log('✓ Data extracted');

        await new Promise((resolve) => setTimeout(resolve, 1000));

        await page.screenshot({ path: 'screenshot.jpeg', fullPage: true });
        console.log('✓ Screenshot saved');

        saveProductData(productData);
        console.log('✓ Data saved to product.txt');

        console.log('✓ Done!');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

main().catch(console.error);