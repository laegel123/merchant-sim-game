import { Product } from './class/product.js';
import { Merchant } from './class/merchant.js';
import { Gold } from './class/gold.js';
import { MerchantManager } from './class/merchant.js';
import { createMarkers } from './js/map.js';
import { openMerchantTradePopup, openMyTradePopup } from './js/trade.js';
import { addMerchant } from './js/merchant.js';

const goldManager = new Gold(1000);
const merchantManager = new MerchantManager();

let products = [];
let cities = [];
let myCity = "Far Farm";

window.addMerchant = addMerchant;
window.openMerchantPopup = openMerchantPopup;

async function loadCities() {
    const response = await fetch('./data/cities.json');
    const data = await response.json();
    return data.cities;
}


window.onload = async () => {
    cities = await loadCities();
    const possibleGoods = ['Wood', 'Iron', 'Coal', 'Wheat', 'Fish', 'Clay', 'Oil', 'Wine', 'Spices', 'Silk', 'Grain', 'Textiles', 'Leather', 'Gems', 'Glass', 'Salt', 'Honey', 'Fruits', 'Vegetables', 'Meat'];

    cities.forEach(city => {
        const numSelling = Math.floor(Math.random() * 3) + 1;
        const numWanting = Math.floor(Math.random() * 3) + 1;
        city.selling = [];
        city.wanting = [];
        const shuffleGoods = [...possibleGoods].sort(() => 0.5 - Math.random());

        for (let i = 0; i < numSelling; i++) {
            city.selling.push({ item: shuffleGoods[i], price: Math.floor(Math.random() * 51) + 10 });
        }
        for (let i = 0; i < numWanting; i++) {
            city.wanting.push({ item: shuffleGoods[i + numSelling], price: Math.floor(Math.random() * 91) + 10 });
        }
    });

    createMarkers(cities);
    renderStatus();
};

function renderStatus() {
    const yourCityElement = document.getElementById('my-city');
    const myGoldElement = document.getElementById('my-gold');
    const totalGoldElement = document.getElementById('total-gold');
    if (yourCityElement) {
        yourCityElement.textContent = `${myCity}`;
    }

    if (myGoldElement) {
        myGoldElement.textContent = `${goldManager.getMyGold()}`;
    }

    if (totalGoldElement) {
        totalGoldElement.textContent = `${goldManager.getTotalGold()}`;
    }
}

function openMerchantPopup() {
    if (document.getElementById('merchant-popup')) {
        return;
    }

    const popup = document.createElement('div');
    popup.classList.add('merchant-popup');
    popup.id = 'merchant-popup';

    const merchantList = merchantManager.getMerchants();
    const title = document.createElement('h3');
    title.textContent = 'My Merchants';
    popup.appendChild(title);

    if (merchantList.length === 0) {
        const emptyMsg = document.createElement('p');
        
        popup.appendChild(emptyMsg);
    } else {
        const ul = document.createElement('ul');
        merchantList.forEach(m => {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.innerHTML = `<strong>${m.name} (${m.status})</strong> (${m.city}) (${m.gold})`;
            link.href = '#';
            link.onclick = (e) => {
                e.preventDefault();
                openMyTradePopup(m);
            };
            li.appendChild(link);
            ul.appendChild(li);
        });
        popup.appendChild(ul);
    }

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.classList.add('popup-close-btn');
    closeBtn.onclick = () => {
        const childPopup1 = document.getElementById('my-merchant-gold-popup');
        const childPopup2 = document.getElementById('my-merchant-inventory-popup');
        if (childPopup1) {childPopup1.remove();}
        if (childPopup2) {childPopup2.remove();}
        popup.remove();
    }
    popup.appendChild(closeBtn);

    // Add Manage Merchants button
    const actionBtn = document.createElement('button');
    actionBtn.textContent = 'Hire Merchant';
    actionBtn.classList.add('popup-action-btn');
    actionBtn.onclick = () => {
        addMerchant();
        popup.remove();
        openMerchantPopup();
    }
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('popup-button-bottom-container');
    buttonContainer.appendChild(actionBtn);
    popup.appendChild(buttonContainer);


    document.body.appendChild(popup);
}

export { cities, myCity, renderStatus, goldManager, merchantManager, openMerchantTradePopup, openMyTradePopup, openMerchantPopup };