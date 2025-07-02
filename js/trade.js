import { Product } from '../class/product.js';
import { myCity, cities, goldManager, renderStatus } from '../main.js';


function openMyTradePopup(merchant) {
    const merchantCityName = merchant.city;
    if (myCity !== merchantCityName) {
        alert(`You can only trade with merchants in your current city: ${myCity}.`);
        return;
    }

    if (document.getElementById('my-merchant-gold-popup')) {
        document.getElementById('my-merchant-gold-popup').remove();
        document.getElementById('my-merchant-inventory-popup').remove();
    }


    const popup = document.createElement('div');
    popup.id = 'my-merchant-gold-popup';
    popup.className = 'merchant-right-top-popup';
    popup.innerHTML = `
        <h3>Trade Gold</h3>
        <hr />
        <div style="margin-bottom: 10px;">
            <label>Your Gold: ${goldManager.getMyGold()}</label>
        </div>
        <div style="margin-bottom: 10px;">
            <label>${merchant.name}'s Gold: ${merchant.getGold()}</label>
        </div>
        <div style="margin-bottom: 10px;">
            <input type="number" id="gold-amount" placeholder="Gold amount" />
            <div class="mt-20">
                <button id="give-gold">Give Gold to Merchant</button>
                <button id="take-gold">Take Gold from Merchant</button>
            </div>
        </div>
    `;

    document.body.appendChild(popup);
    


    document.getElementById('give-gold').onclick = () => {
        const amount = parseInt(document.getElementById('gold-amount').value);
        if (!isNaN(amount) && amount > 0 && goldManager.getMyGold() >= amount) {
            merchant.addGold(amount);
            goldManager.subtractMyGold(amount);
            renderStatus();
            document.getElementById('my-merchant-gold-popup').remove();
            document.getElementById('my-merchant-inventory-popup').remove();
            // popup.remove();
            openMyTradePopup(merchant);
            alert(`Gave ${amount} gold to ${merchant.name}.`);
        } else {
            alert("Invalid amount or not enough gold.");
        }
    };

    document.getElementById('take-gold').onclick = () => {
        const amount = parseInt(document.getElementById('gold-amount').value);
        if (!isNaN(amount) && amount > 0 && merchant.getGold() >= amount) {
            merchant.subtractGold(amount);
            goldManager.addMyGold(amount);
            renderStatus();
            document.getElementById('my-merchant-gold-popup').remove();
            document.getElementById('my-merchant-inventory-popup').remove();
            popup.remove();
            openMyTradePopup(merchant);
            alert(`Took ${amount} gold from ${merchant.name}.`);
        } else {
            alert("Invalid amount or merchant doesn't have enough gold.");
        }
    };

    const popup2 = document.createElement('div');
    popup2.id = 'my-merchant-inventory-popup';
    popup2.className = 'merchant-right-bottom-popup';
    popup2.innerHTML = `
        <h3>${merchant.name}'s Inventory</h3>
        <hr />
        <div style="margin-bottom: 10px;">
            <ul id="merchant-inventory-list"></ul>
        </div>
    `;

    document.body.appendChild(popup2);

    const inventoryList = popup2.querySelector('#merchant-inventory-list');
    if (merchant.products && merchant.products.length > 0) {
        merchant.products.forEach(product => {
            const li = document.createElement('li');
            li.textContent = `${product.item} (x${product.qty}) - ${product.price} gold each`;
            inventoryList.appendChild(li);
        });
    }
    



}

function openMerchantTradePopup(merchant, cityName) {
    if (document.getElementById('merchant-trade-popup')) {
        return;
    }
    const city = cities.find(c => c.name === cityName);
    const popup = document.createElement('div');
    popup.className = 'merchant-popup';
    popup.id = 'merchant-trade-popup';

    popup.innerHTML = `
        <h3>${merchant.name} (${merchant.city})</h3>
        <div style="padding: 10px">
            <div>city : ${merchant.city}</div>
            <div>gold : ${merchant.getGold()}</div>
        </div>
        <button id="popup-close-btn2" class="popup-close-btn"><img src="/assets/icon/close-circle.svg" alt="Close" class="popup-close-icon" /></button>
        <div style="padding: 10px">
            <hr />
            <div id="tab-container" style="display: flex; margin-bottom: 10px; border-bottom: 2px solid #999;">
                <div id="buy-tab" style="flex: 1; text-align: center; padding: 10px; cursor: pointer;">Buy</div>
                <div id="sell-tab" style="flex: 1; text-align: center; padding: 10px; cursor: pointer;">Sell</div>
            </div>
            <div id="trade-content"></div>
        </div>
    `;

    document.body.appendChild(popup);
    
    

    document.getElementById('popup-close-btn2').onclick = () => {
        popup.remove();
    };

    const tradeContent = popup.querySelector('#trade-content');
    const sellTab = popup.querySelector('#sell-tab');
    const buyTab = popup.querySelector('#buy-tab');

    // Add style for active-tab
    const style = document.createElement('style');
    style.textContent = `
        .active-tab {
            background-color: #f0e6d2;
            font-weight: bold;
            border: 2px solid #555;
            border-bottom: none;
            border-radius: 5px 5px 0 0;
        }
    `;
    popup.appendChild(style);

    function activateTab(tabButton, renderFn) {
        sellTab.classList.remove('active-tab');
        buyTab.classList.remove('active-tab');
        tabButton.classList.add('active-tab');
        renderFn();
    }

    sellTab.onclick = () => activateTab(sellTab, renderSellView);
    buyTab.onclick = () => activateTab(buyTab, renderBuyView);

    function renderSellView() {
        // const productList = merchant.getAvailableSellProductsInCity(city) || [];
        const productList = merchant.products || [];
        let totalSellGold = 0;

        tradeContent.innerHTML = `
            <div style="display: flex; flex-direction: column; justify-content: space-between; padding-bottom: 10px;">
                <div style="text-align: center; margin-bottom: 10px"><strong>Owned Items</strong></div>
                <ul id="owned-items"></ul>
            </div>
            <hr />
            <div style="display: flex; flex-direction: column; justify-content: space-between; margin-top: 10px">
                <div style="text-align: center; margin-bottom: 10px"><strong>Items to Sell</strong></div>
                <ul id="selected-items"></ul>
            </div>
            <div style="margin-top: 10px; text-align: center">Sell Gold: <span id="sell-total">${totalSellGold}</span></div>
            <button id="confirm-sell" class="confirm-btn">Sell</button>
        `;

        const ownedList = tradeContent.querySelector('#owned-items');
        const selectedList = tradeContent.querySelector('#selected-items');
        const sellTotal = tradeContent.querySelector('#sell-total');
        let sellItems = [];

        productList.forEach(p => {
            const li = document.createElement('li');
            li.textContent = `${p.item}(${p.price + city.profit}) x${p.qty} [+]`;
            li.style.cursor = 'pointer';
            li.onclick = () => {
                const qtyStr = prompt(`How many units of ${p.item} would you like to sell?`, '1');
                const qty = parseInt(qtyStr);
                if (!isNaN(qty) && qty > 0) {
                    totalSellGold += p.price * qty;
                    sellTotal.textContent = totalSellGold;

                    const existing = sellItems.find(i => i.item === p.item);
                    if (existing) {
                        existing.qty += qty;
                    } else {
                        sellItems.push({ item: p.item, price: p.price + city.profit, qty });
                    }

                    const selectedLi = document.createElement('li');
                    selectedLi.textContent = `${p.item}(${p.price + city.profit}) x${qty}`;
                    selectedList.appendChild(selectedLi);
                }
            };
            ownedList.appendChild(li);
        });

        const confirmSellBtn = tradeContent.querySelector('#confirm-sell');
        confirmSellBtn.onclick = () => {
            if (totalSellGold > 0 && confirm(`Sell selected items for ${totalSellGold} gold?`)) {
                merchant.addGold(totalSellGold);
                goldManager.addTotalGold(totalSellGold);

                sellItems.forEach(i => {
                    const product = new Product(i.item, i.qty, i.price);
                    merchant.subtractProduct(product);
                });

                renderStatus();
                popup.remove();
            }
        };
    }

    function renderBuyView() {
        const citySelling = city.selling || [];
        let totalBuyGold = 0;

        tradeContent.innerHTML = `
            <div style="display: flex; flex-direction: column; justify-content: space-between; padding-bottom: 10px;">
                <div style="text-align: center; margin-bottom: 10px"><strong>City is Selling</strong></div>
                <ul id="selling-items"></ul>
            </div>
            <hr />
            <div style="display: flex; flex-direction: column; justify-content: space-between; margin-top: 10px">
                <div style="text-align: center; margin-bottom: 10px"><strong>Items to Buy</strong></div>
                <ul id="buying-items"></ul>
            </div>
            <div style="margin-top: 10px; text-align: center;">Total Cost: <span id="buy-total">${totalBuyGold}</span></div>
            <button id="confirm-buy" class="confirm-btn">Buy</button>
        `;

        const sellingList = tradeContent.querySelector('#selling-items');
        const buyingList = tradeContent.querySelector('#buying-items');
        const buyTotal = tradeContent.querySelector('#buy-total');
        let buyItems = [];

        citySelling.forEach(p => {
            const li = document.createElement('li');
            const itemHTML = document.createElement('div');
            itemHTML.innerHTML = `${p.item} : ${p.price} gold 
                <button class="add-item" style="margin-left: 6px; margin-top: 2px; vertical-align: middle;">
                    <img src="/assets/icon/plus-circle.svg" alt="Add" style="width: 16px; height: 16px;" />
                </button> 
                <button class="remove-item" style="margin-left: 4px; margin-top: 2px; vertical-align: middle;">
                    <img src="/assets/icon/minus-circle.svg" alt="Remove" style="width: 16px; height: 16px;" />
                </button>`;
            li.appendChild(itemHTML);
            sellingList.appendChild(li);

            const addButton = itemHTML.querySelector('.add-item');
            const removeButton = itemHTML.querySelector('.remove-item');

            addButton.onclick = () => {
                const qtyStr = prompt(`How many ${p.item} would you like to buy?`, '1');
                const qty = parseInt(qtyStr);
                if (!isNaN(qty) && qty > 0) {
                    const existing = buyItems.find(i => i.item === p.item);
                    if (existing) {
                        existing.qty += qty;
                    } else {
                        buyItems.push({ item: p.item, price: p.price, qty });
                    }
                    totalBuyGold += p.price * qty;
                    updateBuyingList();
                }
            };

            removeButton.onclick = () => {
                const qtyStr = prompt(`How many ${p.item} would you like to remove?`, '1');
                const qty = parseInt(qtyStr);
                if (!isNaN(qty) && qty > 0) {
                    const existing = buyItems.find(i => i.item === p.item);
                    if (existing) {
                        const removedQty = Math.min(qty, existing.qty);
                        existing.qty -= removedQty;
                        totalBuyGold -= p.price * removedQty;
                        if (existing.qty <= 0) {
                            buyItems = buyItems.filter(i => i.item !== p.item);
                        }
                        updateBuyingList();
                    }
                }
            };
        });

        function updateBuyingList() {
            buyingList.innerHTML = '';
            buyItems.forEach(i => {
                const li = document.createElement('li');
                li.textContent = `${i.item} x${i.qty}`;
                buyingList.appendChild(li);
            });
            buyTotal.textContent = totalBuyGold;
        }

        const confirmBuyBtn = tradeContent.querySelector('#confirm-buy');
        confirmBuyBtn.onclick = () => {
            if (totalBuyGold > 0 && confirm(`Spend ${totalBuyGold} gold to buy selected items?`)) {

                if (merchant.getGold() < totalBuyGold) {
                    alert(`${merchant.getName()} don't have enough gold to complete this purchase.`);
                    return;
                }

                for (const i of buyItems) {
                    merchant.addProduct(new Product(i.item, i.qty, i.price));
                }

                merchant.subtractGold(totalBuyGold);
                goldManager.subtractTotalGold(totalBuyGold);

                renderStatus();
                alert("Purchase completed!");
                popup.remove();
            }
        };
    }

    // Initialize with Buy tab active and content
    buyTab.classList.add('active-tab');
    renderBuyView();
}

export { openMerchantTradePopup, openMyTradePopup };