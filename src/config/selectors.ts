import dotenv from 'dotenv';

dotenv.config({quiet: true});

export const SELECTORS = {
    region: {
        button: process.env.REGION_BUTTON_SELECTOR || '.Region_region__6OUBn',
        list: process.env.REGION_LIST_SELECTOR || '.UiRegionListBase_list__cH0fK',
        item: process.env.REGION_ITEM_SELECTOR || '.UiRegionListBase_button__smgMH',
    },
    cookie: {
        accept: process.env.COOKIE_ACCEPT_SELECTOR || '.Button_withText__7ypqP',
    },
    product: {
        titleBlock: process.env.TITLE_BLOCK_SELECTOR || '.ProductPage_title__3hOtE',
        priceBlock: process.env.PRICE_BLOCK_SELECTOR || '.ProductPage_informationBlock__vDYCH',
        rating: process.env.RATING_SELECTOR || '.ActionsRow_stars__EKt42',
        review: process.env.REVIEW_SELECTOR || '.ActionsRow_reviews__AfSj_',
        price: process.env.PRICE_SELECTOR || '.Price_role_discount__l_tpE',
        oldPrice: process.env.OLD_PRICE_SELECTOR || '.PriceInfo_oldPrice__IW3mC',
    },
    api: {
        nextData: process.env.NEXT_DATA_SELECTOR || '__NEXT_DATA__',
    },
};