import puppeteer from 'puppeteer';
import { SELECTORS } from './config/selectors';
import { type ApiProduct } from './types/product.types';
import { saveApiProducts } from './utils/file-writer';

async function main() {
    const args = process.argv.slice(2);

    if (args.length < 1) {
        console.error('Usage: npm run api <category_url>');
        console.error(
            'Example: npm run api "https://www.vprok.ru/catalog/7382/pomidory-i-ovoschnye-nabory"'
        );
        process.exit(1);
    }

    const categoryUrl = args[0];

    console.log(`Fetching category: ${categoryUrl}`);

    try {
        const products = await fetchProducts(categoryUrl);
        console.log(`✓ Found ${products.length} products`);

        saveApiProducts(products);
        console.log('✓ Products saved to products-api.txt');

        console.log('✓ Done!');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

async function fetchProducts(url: string): Promise<ApiProduct[]> {
    const browser = await puppeteer.launch({
        headless: true,
    });

    try {
        const page = await browser.newPage();

        console.log('Loading page...');
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        try {
            await page.waitForSelector(SELECTORS.cookie.accept, { timeout: 3000 });
            await page.click(SELECTORS.cookie.accept);
        } catch (e) {
            console.log(e);
        }

        await page.waitForFunction(
            (selector) => {
                return document.getElementById(selector) !== null;
            },
            { timeout: 30000 },
            SELECTORS.api.nextData
        );

        const products = await page.evaluate((selector) => {
            const scriptElement = document.getElementById(selector);
            if (!scriptElement || !scriptElement.textContent) {
                throw new Error('__NEXT_DATA__ script not found');
            }


            const jsonData = JSON.parse(scriptElement.textContent);
            console.log('JSON parsed successfully');

            const productsArray =
                jsonData?.props?.pageProps?.initialStore?.catalogPage?.products || [];
            console.log('Products found:', productsArray.length);

            return productsArray;
        }, SELECTORS.api.nextData);

        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

main().catch(console.error);