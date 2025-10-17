import puppeteer from 'puppeteer';
import fs from 'fs';

interface Product {
    productId: number;
    url: string;
    name: string;
    rating?: number;
    reviews?: number;
    price?: number;
    oldPrice?: number;
    discount?: number;
    discountPercent?: number;
}

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

        saveProducts(products);
        console.log('✓ Products saved to products-api.txt');

        console.log('✓ Done!');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

async function fetchProducts(url: string): Promise<Product[]> {
    const browser = await puppeteer.launch({
        headless: true,
    });

    try {
        const page = await browser.newPage();

        page.on('console', (msg) => {
            console.log('Browser console:', msg.text());
        });

        console.log('Loading page...');
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        try {
            await page.waitForSelector('.Button_withText__7ypqP', { timeout: 3000 });
            await page.click('.Button_withText__7ypqP');
            console.log('✓ Cookie modal closed');
        } catch (e) {
            console.log('No cookie modal found');
        }

        console.log('Waiting for __NEXT_DATA__ script...');
        await page.waitForFunction(
            () => {
                return document.getElementById('__NEXT_DATA__') !== null;
            },
            { timeout: 30000 }
        );
        console.log('✓ __NEXT_DATA__ script found');

        const products = await page.evaluate(() => {
            const scriptElement = document.getElementById('__NEXT_DATA__');
            if (!scriptElement || !scriptElement.textContent) {
                throw new Error('__NEXT_DATA__ script not found');
            }

            console.log('Script element found!');

            const jsonData = JSON.parse(scriptElement.textContent);
            console.log('JSON parsed successfully');

            const productsArray =
                jsonData?.props?.pageProps?.initialStore?.catalogPage?.products || [];
            console.log('Products found:', productsArray.length);

            return productsArray;
        });

        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

function saveProducts(products: Product[]): void {
    const lines: string[] = [];

    products.forEach((product, index) => {
        if (index > 0) {
            lines.push('');
        }

        lines.push(`Название товара: ${product.name}`);

        const fullUrl = product.url.startsWith('http')
            ? product.url
            : `https://www.vprok.ru${product.url}`;
        lines.push(`Ссылка на страницу товара: ${fullUrl}`);

        if (product.rating) {
            lines.push(`Рейтинг: ${product.rating}`);
        } else {
            lines.push(`Рейтинг: —`);
        }

        if (product.reviews) {
            lines.push(`Количество отзывов: ${product.reviews}`);
        } else {
            lines.push(`Количество отзывов: 0`);
        }

        if (product.price) {
            lines.push(`Цена: ${product.price} ₽`);
        } else {
            lines.push(`Цена: —`);
        }

        if (product.discount && product.discount > 0 && product.price) {
            lines.push(`Акционная цена: ${product.price} ₽`);
        } else {
            lines.push(`Акционная цена: —`);
        }

        if (product.oldPrice && product.oldPrice > 0) {
            lines.push(`Цена до акции: ${product.oldPrice} ₽`);
        } else {
            lines.push(`Цена до акции: —`);
        }

        if (product.discountPercent && product.discountPercent > 0) {
            lines.push(`Размер скидки: ${product.discountPercent}%`);
        } else if (product.discount && product.discount > 0) {
            lines.push(`Размер скидки: ${product.discount} ₽`);
        } else {
            lines.push(`Размер скидки: —`);
        }
    });

    fs.writeFileSync('products-api.txt', lines.join('\n'), 'utf-8');
}

main().catch(console.error);