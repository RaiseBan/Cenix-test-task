import { type Page } from 'puppeteer';
import { SELECTORS } from '../config/selectors';
import { type ProductData } from '../types/product.types';

export async function extractProductData(page: Page): Promise<ProductData> {
    const data: ProductData = {};

    try {
        const titleBlock = await page.$(SELECTORS.product.titleBlock);
        const priceBlock = await page.$(SELECTORS.product.priceBlock);

        if (titleBlock) {
            const ratingElement = await titleBlock.$(SELECTORS.product.rating);
            if (ratingElement) {
                const ratingText = await page.evaluate(
                    (el) => el.textContent?.trim(),
                    ratingElement
                );
                const ratingMatch = ratingText?.match(/[\d.]+/);
                if (ratingMatch) {
                    data.rating = ratingMatch[0];
                }
            }

            const reviewElement = await titleBlock.$(SELECTORS.product.review);
            if (reviewElement) {
                const reviewText = await page.evaluate(
                    (el) => el.textContent?.trim(),
                    reviewElement
                );
                const reviewMatch = reviewText?.match(/\d+/);
                if (reviewMatch) {
                    data.reviewCount = reviewMatch[0];
                }
            }
        }

        if (priceBlock) {
            const priceElement = await priceBlock.$(SELECTORS.product.price);
            if (priceElement) {
                const priceText = await page.evaluate(
                    (el) => el.textContent?.trim(),
                    priceElement
                );
                const priceMatch = priceText?.match(/[\d,]+/);
                if (priceMatch) {
                    data.price = priceMatch[0].replace(',', '.');
                }
            }

            const oldPriceElement = await priceBlock.$(SELECTORS.product.oldPrice);
            if (oldPriceElement) {
                const oldPriceText = await page.evaluate(
                    (el) => el.textContent?.trim(),
                    oldPriceElement
                );
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