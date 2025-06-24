import { Product } from '../class/product.js';
import { cities, goldManager, renderGold } from '../main.js';

export function openTradePopup(merchant, cityName) {
    const city = cities.find(c => c.name === cityName);

    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.backgroundColor = 'white';
    popup.style.padding = '20px';
    popup.style.border = '2px solid black';
    popup.style.zIndex = '1000';
    popup.style.width = '400px';

    popup.innerHTML = `
        <div style="display:flex; justify-content: space-between; margin-bottom: 10px;">
            <button id="sell-tab">Sell</button>
            <button id="buy-tab">Buy</button>
        </div>
        <div id="trade-content"></div>
        <button id="close-popup">Close</button>
    `;

    document.body.appendChild(popup);

    document.getElementById('close-popup').onclick = () => {
        popup.remove();
    };

    const tradeContent = popup.querySelector('#trade-content');
    const sellTab = popup.querySelector('#sell-tab');
    const buyTab = popup.querySelector('#buy-tab');

    sellTab.onclick = () => renderSellView();
    buyTab.onclick = () => renderBuyView();

    function renderSellView() {
        const productList = merchant.products || [];
        let totalSellGold = 0;

        tradeContent.innerHTML = `
            <div><strong>${merchant.name} (${merchant.city})</strong></div>
            <hr />
            <div style="display: flex; justify-content: space-between;">
                <div><strong>Owned Items</strong></div>
                <div><strong>Items to Sell</strong></div>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <ul id="owned-items"></ul>
                <ul id="selected-items"></ul>
            </div>
            <div style="margin-top: 10px;">Sell Gold: <span id="sell-total">${totalSellGold}</span></div>
        `;

        const ownedList = tradeContent.querySelector('#owned-items');
        const selectedList = tradeContent.querySelector('#selected-items');
        const sellTotal = tradeContent.querySelector('#sell-total');

        productList.forEach(p => {
            const li = document.createElement('li');
            li.textContent = `${p.name} [+]`;
            li.style.cursor = 'pointer';
            li.onclick = () => {
                const qtyStr = prompt(`How many units of ${p.name} would you like to sell?`, '1');
                const qty = parseInt(qtyStr);
                if (!isNaN(qty) && qty > 0) {
                    const cityPrice = city.wanting.find(w => w.item === p.name)?.price || 0;
                    totalSellGold += cityPrice * qty;
                    sellTotal.textContent = totalSellGold;

                    const selectedLi = document.createElement('li');
                    selectedLi.textContent = `${p.name} x${qty}`;
                    selectedList.appendChild(selectedLi);
                }
            };
            ownedList.appendChild(li);
        });
    }

    function renderBuyView() {
        const citySelling = city.selling || [];
        let totalBuyGold = 0;

        tradeContent.innerHTML = `
            <div><strong>${merchant.name} (${merchant.city})</strong></div>
            <hr />
            <div style="display: flex; justify-content: space-between;">
                <div><strong>City is Selling</strong></div>
                <div><strong>Items to Buy</strong></div>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <ul id="selling-items"></ul>
                <ul id="buying-items"></ul>
            </div>
            <div style="margin-top: 10px;">Total Cost: <span id="buy-total">${totalBuyGold}</span></div>
        `;

        const sellingList = tradeContent.querySelector('#selling-items');
        const buyingList = tradeContent.querySelector('#buying-items');
        const buyTotal = tradeContent.querySelector('#buy-total');

        citySelling.forEach(p => {
            const li = document.createElement('li');
            li.textContent = `${p.item} : ${p.price} gold [+]`;
            li.style.cursor = 'pointer';
            li.onclick = () => {
                const qtyStr = prompt(`How many units of ${p.item} would you like to buy?`, '1');
                const qty = parseInt(qtyStr);
                if (!isNaN(qty) && qty > 0) {
                    const cost = p.price * qty;
                    if (gold >= cost) {
                        gold -= cost;
                        renderGold();
                        totalBuyGold += cost;
                        buyTotal.textContent = totalBuyGold;

                        const buyLi = document.createElement('li');
                        buyLi.textContent = `${p.item} x${qty}`;
                        buyingList.appendChild(buyLi);

                        for (let i = 0; i < qty; i++) {
                            merchant.products.push(new Product(p.item));
                        }
                    } else {
                        alert("Not enough gold.");
                    }
                }
            };
            sellingList.appendChild(li);
        });
    }

    renderSellView();
}