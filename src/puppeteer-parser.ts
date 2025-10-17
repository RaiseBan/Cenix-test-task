import puppeteer, { type Page } from 'puppeteer';
import fs from 'fs';

interface ProductData {
    price?: string;
    priceOld?: string;
    rating?: string;
    reviewCount?: string;
}

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

async function selectRegion(page: Page, region: string): Promise<boolean> {
    try {
        await page.waitForSelector('.Region_region__6OUBn', { timeout: 5000 });

        await page.click('.Region_region__6OUBn');

        await page.waitForSelector('.UiRegionListBase_list__cH0fK', { visible: true });

        const buttons = await page.$$('.UiRegionListBase_button__smgMH');

        for (const button of buttons) {
            const text = await page.evaluate((el) => el.textContent?.trim(), button);
            if (text === region) {
                await button.evaluate((el) => el.scrollIntoView({ block: 'center' }));
                await new Promise((resolve) => setTimeout(resolve, 300));

                await button.click();

                await new Promise((resolve) => setTimeout(resolve, 2000));

                return true;
            }
        }

        console.error(`Region "${region}" not found in the list`);
        return false;
    } catch (error) {
        console.error('Error selecting region:', error);
        console.log("\n" +
            "Perhaps you have a bad internet connection...")
        return false;
    }
}

async function extractProductData(page: Page): Promise<ProductData> {
    const data: ProductData = {};

    try {
        const titleBlock = await page.$('.ProductPage_title__3hOtE');
        const priceBlock = await page.$('.ProductPage_informationBlock__vDYCH');
        console.log(priceBlock)
        if (titleBlock) {
            const ratingElement = await titleBlock.$('.ActionsRow_stars__EKt42');
            if (ratingElement) {
                const ratingText = await page.evaluate((el) => el.textContent?.trim(), ratingElement);
                const ratingMatch = ratingText?.match(/[\d.]+/);
                if (ratingMatch) {
                    data.rating = ratingMatch[0];
                }
            }

            const reviewElement = await titleBlock.$('.ActionsRow_reviews__AfSj_');
            if (reviewElement) {
                const reviewText = await page.evaluate((el) => el.textContent?.trim(), reviewElement);
                const reviewMatch = reviewText?.match(/\d+/);
                if (reviewMatch) {
                    data.reviewCount = reviewMatch[0];
                }
            }
        }
        if (priceBlock){
            const priceElement = await priceBlock.$('.Price_role_discount__l_tpE');
            if (priceElement) {
                const priceText = await page.evaluate((el) => el.textContent?.trim(), priceElement);
                const priceMatch = priceText?.match(/[\d,]+/);
                if (priceMatch) {
                    data.price = priceMatch[0].replace(',', '.');
                }
            }

            const oldPriceElement = await priceBlock.$('.PriceInfo_oldPrice__IW3mC');
            if (oldPriceElement) {
                const oldPriceText = await page.evaluate((el) => el.textContent?.trim(), oldPriceElement);
                const oldPriceMatch = oldPriceText?.match(/[\d,]+/);
                if (oldPriceMatch) {
                    data.priceOld = oldPriceMatch[0].replace(',', '.');
                }
            }
        }


        return data;
    } catch (error) {
        console.error('Error extracting product data:', error);
        return data;
    }
}

function saveProductData(data: ProductData): void {
    const lines: string[] = [];

    if (data.price) lines.push(`price=${data.price}`);
    if (data.priceOld) lines.push(`priceOld=${data.priceOld}`);
    if (data.rating) lines.push(`rating=${data.rating}`);
    if (data.reviewCount) lines.push(`reviewCount=${data.reviewCount}`);

    fs.writeFileSync('product.txt', lines.join('\n'), 'utf-8');
}

main().catch(console.error);