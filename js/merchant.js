import { Merchant } from '../class/merchant.js';
import { myCity, renderStatus, goldManager, merchantManager, openMyTradePopup } from '../main.js';


let merchantNames = [];

async function loadMerchantNames() {
    const response = await fetch('./data/merchant_names.json');
    const data = await response.json();
    return data.names;
}

merchantNames = await loadMerchantNames();

function addMerchant() {
    if (goldManager.getMyGold() < 200) {
        alert("You need at least 200 gold to hire a merchant.");
        return;
    }
    goldManager.subtractMyGold(200);
    goldManager.subtractTotalGold(200);
    const randomName = merchantNames[Math.floor(Math.random() * merchantNames.length)];
    const newMerchant = new Merchant(randomName, myCity);
    merchantManager.addMerchant(newMerchant);
    renderStatus();
    
}



export { addMerchant};