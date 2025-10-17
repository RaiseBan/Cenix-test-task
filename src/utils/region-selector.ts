import { type Page } from 'puppeteer';
import { SELECTORS } from '../config/selectors';

export async function selectRegion(page: Page, region: string): Promise<boolean> {
    try {
        await page.waitForSelector(SELECTORS.region.button, { timeout: 5000 });
        await page.click(SELECTORS.region.button);

        await page.waitForSelector(SELECTORS.region.list, { visible: true });

        const buttons = await page.$$(SELECTORS.region.item);

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
        console.log('\nPerhaps you have a bad internet connection...');
        return false;
    }
}