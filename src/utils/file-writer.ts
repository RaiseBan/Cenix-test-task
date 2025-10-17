import fs from 'fs';
import { type ProductData, type ApiProduct } from '../types/product.types';

export function saveProductData(data: ProductData): void {
    const lines: string[] = [];

    if (data.price) lines.push(`price=${data.price}`);
    if (data.priceOld) lines.push(`priceOld=${data.priceOld}`);
    if (data.rating) lines.push(`rating=${data.rating}`);
    if (data.reviewCount) lines.push(`reviewCount=${data.reviewCount}`);

    fs.writeFileSync('product.txt', lines.join('\n'), 'utf-8');
}

export function saveApiProducts(products: ApiProduct[]): void {
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