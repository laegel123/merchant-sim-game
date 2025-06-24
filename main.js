import { Product } from './class/product.js';
import { Merchant } from './class/merchant.js';
import { Gold } from './class/gold.js';
import { MerchantManager } from './class/merchant.js';
import { createMarkers } from './js/map.js';
import { openTradePopup } from './js/trade.js';
import { addMerchant, renderMerchantList } from './js/merchant.js';

const goldManager = new Gold(1000);
const merchantManager = new MerchantManager();

let products = [];
let cities = [];
let city = "Far Farm";

window.addMerchant = addMerchant;

async function loadCities() {
    const response = await fetch('./data/cities.json');
    const data = await response.json();
    return data.cities;
}


window.onload = async () => {
    console.log("11 > ", cities);
    cities = await loadCities();
    console.log("22 > ", cities);
    const possibleGoods = ['Wood', 'Iron', 'Coal', 'Wheat', 'Fish', 'Clay', 'Oil', 'Wine', 'Spices', 'Silk', 'Grain', 'Textiles', 'Leather', 'Gems', 'Glass', 'Salt', 'Honey', 'Fruits', 'Vegetables', 'Meat'];

    cities.forEach(city => {
        const numSelling = Math.floor(Math.random() * 3) + 1;
        const numWanting = Math.floor(Math.random() * 3) + 1;
        city.selling = [];
        city.wanting = [];
        const shuffleGoods = [...possibleGoods].sort(() => 0.5 - Math.random());

        for (let i = 0; i < numSelling; i++) {
            city.selling.push({ item: shuffleGoods[i], price: Math.floor(Math.random() * 91) + 10 });
        }
        for (let i = 0; i < numWanting; i++) {
            city.wanting.push({ item: shuffleGoods[i + numSelling], price: Math.floor(Math.random() * 91) + 10 });
        }
    });

    console.log(cities);
    createMarkers(cities);
    renderGold();
};

function renderGold() {
    const goldElement = document.getElementById('gold');
    if (goldElement) {
        goldElement.textContent = `${goldManager.getGold()}`;
    }
}

export { cities, city, renderGold, goldManager, merchantManager, openTradePopup };