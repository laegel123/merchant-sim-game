import { Merchant } from '../class/merchant.js';
import { city, renderGold, goldManager, merchantManager } from '../main.js';


let merchantNames = [];

async function loadMerchantNames() {
    const response = await fetch('./data/merchant_names.json');
    const data = await response.json();
    return data.names;
}

merchantNames = await loadMerchantNames();

function addMerchant() {
    if (goldManager.getGold() < 200) {
        alert("You need at least 200 gold to hire a merchant.");
        return;
    }
    goldManager.subtractGold(200);
    const randomName = merchantNames[Math.floor(Math.random() * merchantNames.length)];
    const newMerchant = new Merchant(randomName, city);
    merchantManager.addMerchant(newMerchant);
    renderGold();
    renderMerchantList();
}

function renderMerchantList() {
    const merchantList = document.getElementById('merchant-items');
    merchantList.innerHTML = '';

    merchantManager.getMerchants().forEach(m => {
        const li = document.createElement('li');
        li.textContent = `${m.name} (city: ${m.city})`;
        merchantList.appendChild(li);
    });
}

export { addMerchant, renderMerchantList };