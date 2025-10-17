# vprok-parser

Парсер для сайта www.vprok.ru на TypeScript с использованием Puppeteer.

## Установка

```bash
npm install
cp .env.example .env
```

## Использование

### Часть 1: Puppeteer Parser

Парсинг страницы товара с выбором региона и созданием скриншота.

```bash
npm run puppeteer "https://www.vprok.ru/product/domik-v-derevne-dom-v-der-moloko-ster-3-2-950g--309202" "Санкт-Петербург и область"
```

Результат: `screenshot.jpeg` и `product.txt`

### Часть 2: API Parser

Сбор данных о товарах из категории через `__NEXT_DATA__`.

```bash
npm run api "https://www.vprok.ru/catalog/7382/pomidory-i-ovoschnye-nabory"
```

Результат: `products-api.txt`

## Структура проекта

```
src/
├── config/selectors.ts      # Конфигурация селекторов из .env
├── types/product.types.ts   # TypeScript типы
├── utils/                   # Утилиты (выбор региона, извлечение данных, сохранение)
├── puppeteer-parser.ts      # Puppeteer парсер
└── api-parser.ts            # API парсер
```

## Конфигурация

CSS-селекторы находятся в `.env` файле. При изменении структуры сайта достаточно обновить `.env` без пересборки проекта.
