import { Gold } from './class/gold.js';
import { MerchantManager } from './class/merchant.js';
import { createMarkers } from './js/map.js';
import { addMerchant } from './js/merchant.js';
import { openMerchantTradePopup, openMyTradePopup } from './js/trade.js';

const goldManager = new Gold(1000);
const merchantManager = new MerchantManager();

let cities = [];
let myCity = "Far Farm";

window.addMerchant = addMerchant;
window.openMerchantPopup = openMerchantPopup;
window.save = save;
window.load = load;

async function initCities() {
    const response = await fetch('http://localhost:3000/api/cities');
    const data = await response.json();
    return data;
}

function save() {
    if (!confirm("Would you like to save the current game data?")) return;
    saveCities(cities);
    saveMerchants(merchantManager.getMerchants());
    const gold = {
        'myGold': goldManager.getMyGold(),
        'totalGold' : goldManager.getTotalGold()
    }
    saveGold(gold);
}

function load() {
    if (confirm("Would you like to load the saved data?")) {
        loadCities();
        loadMerchants();
        loadGold();
        setTimeout(() => {
            renderStatus();
        }, 500);
    }
}

async function saveCities(cities) {
    try {
        const response = await fetch('http://localhost:3000/api/cities/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cities })
        });

        if (!response.ok) {
            throw new Error('Failed to save cities');
        }

        const result = await response.json();
    } catch (error) {
        console.error('Error saving cities:', error);
    }
}

async function saveMerchants(merchants) {
    try {
        const response = await fetch('http://localhost:3000/api/merchants/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ merchants })
        });
        if (!response.ok) {
            throw new Error('Failed to save merchants');
        }

        const result = await response.json();
    } catch (error) {
        console.error('Error saving merchants:', error);
    }
}

async function saveGold(gold) {
    try {
        const response = await fetch('http://localhost:3000/api/gold/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ gold })
        });
        if (!response.ok) {
            throw new Error('Failed to save gold');
        }

        const result = await response.json();
    } catch (error) {
        console.error('Error saving gold:', error);
    }
}



window.onload = async () => {
    cities = await initCities();
    // const possibleGoods = ['Wood', 'Iron', 'Coal', 'Wheat', 'Fish', 'Clay', 'Oil', 'Wine', 'Spices', 'Silk', 'Grain', 'Textiles', 'Leather', 'Gems', 'Glass', 'Salt', 'Honey', 'Fruits', 'Vegetables', 'Meat'];

    // cities.forEach(city => {
    //     const numSelling = Math.floor(Math.random() * 3) + 1;
    //     const numWanting = Math.floor(Math.random() * 3) + 1;
    //     city.selling = [];
    //     city.wanting = [];
    //     const shuffleGoods = [...possibleGoods].sort(() => 0.5 - Math.random());

    //     for (let i = 0; i < numSelling; i++) {
    //         city.selling.push({ item: shuffleGoods[i], price: Math.floor(Math.random() * 51) + 10 });
    //     }
    //     for (let i = 0; i < numWanting; i++) {
    //         city.wanting.push({ item: shuffleGoods[i + numSelling], price: Math.floor(Math.random() * 91) + 10 });
    //     }
    // });

    createMarkers(cities);
    renderStatus();
};

async function loadCities() {
    try {
        const response = await fetch('http://localhost:3000/api/cities/load');
        const data = await response.json();
        cities = data.cities;
    } catch (error) {
        console.error('Error loading cities:', error);
    }
}

async function loadMerchants() {
    try {
        const response = await fetch('http://localhost:3000/api/merchants/load');
        const data = await response.json();
        merchantManager.setMerchants(data);

        const merchants = merchantManager.getMerchants();
        const now = Date.now();

        merchants.forEach(m => {
            if (m.status === 'moving' && m.movingInfo) {
                let { startTime, travelTime, to, remaining } = m.movingInfo;
                if (remaining == null) {
                    const elapsed = Math.max(0, (now - startTime) / 1000);
                    remaining = Math.max(0, travelTime - elapsed);
                }
                
                if (remaining > 0) {
                    const lineKey = [m.city, to].sort().join('-');
                    const animatedLine = document.querySelector(`#mapLines line[data-key="${lineKey}"]`);

                    if (animatedLine) {
                        const fromCity = cities.find(c => c.name === m.city);
                        const fromX = (fromCity.q * 32 + 16) / document.getElementById('mapImage').naturalWidth * 200;
                        const fromY = (fromCity.r * 28 + 14) / document.getElementById('mapImage').naturalHeight * 230;

                        const x1 = parseFloat(animatedLine.getAttribute("x1"));
                        const y1 = parseFloat(animatedLine.getAttribute("y1"));

                        const closeEnough = (a, b) => Math.abs(a - b) < 1;
                        const correctDirection = closeEnough(x1, fromX) && closeEnough(y1, fromY);

                        animatedLine.classList.remove('animated-line');
                        void animatedLine.offsetWidth;
                        animatedLine.classList.add('animated-line');
                        animatedLine.style.animationDirection = correctDirection ? 'reverse' : 'normal';
                    }

                    setTimeout(() => {
                        m.status = 'wait';
                        m.city = to;
                        m.movingInfo = null;
                        if (animatedLine) {
                            animatedLine.classList.remove('animated-line');
                            animatedLine.style.animationDirection = '';
                        }
                        renderStatus();
                        alert(`${m.name} has arrived in ${to}`);
                    }, remaining * 1000);
                } else {
                    m.status = 'wait';
                    m.city = to;
                    m.movingInfo = null;
                }
            }
        });
    } catch (error) {
        console.error('Error loading merchants:', error);
    }
}

async function loadGold() {
    try {
        const response = await fetch('http://localhost:3000/api/gold/load');
        const data = await response.json();
        goldManager.setMyGold(data.myGold);
        goldManager.setTotalGold(data.totalGold);
    } catch (error) {
        console.error('Error loading gold:', error);
    }
}


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
        ul.style.marginTop = '50px';
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
    closeBtn.innerHTML = '<img src="/assets/icon/close-circle.svg" alt="Close" class="popup-close-icon" />';
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

export { cities, goldManager, merchantManager, myCity, openMerchantPopup, openMerchantTradePopup, openMyTradePopup, renderStatus };
