export class Merchant {
    constructor(name, city = null) {
        this.name = name;
        this.city = city;
        this.gold = 0;
        this.status = 'wait'; // wait, moving
        this.products = [];
        this.movingInfo = null;
    }

    addProduct(product) {
        let existingProduct = this.products.find(p => p.item === product.item);
        if (existingProduct) {
            existingProduct.qty += product.qty;
        } else {
            this.products.push(product);
        }
    }

    subtractProduct(product) {
        let existingProduct = this.products.find(p => p.item === product.item);
        if (existingProduct) {
            if (existingProduct.qty >= product.qty) {
                existingProduct.qty -= product.qty;
                if (existingProduct.qty === 0) {
                    this.products = this.products.filter(p => p.item !== product.item);
                }
            } else {
                console.warn("Not enough quantity to subtract the specified amount.");
            }
        } else {
            console.warn("Product not found in merchant's inventory.");
        }
    }

    changeCity(city) {
        this.city = city;
    }

    changeStatus(status) {
        if (['wait', 'moving'].includes(status)) {
            this.status = status;
        } else {
            console.warn("Invalid status. Use 'wait' or 'moving'.");
        }
    }

    addGold(amount) {
        this.gold += amount;
    }

    subtractGold(amount) {
        if (this.gold >= amount) {
            this.gold -= amount;
        } else {
            console.warn("Not enough gold to subtract the specified amount.");
        }
    }

    getGold() {
        return this.gold;
    }

    getName() {
        return this.name;
    }

    getAvailableSellProductsInCity(city) {
    const wanting = city.wanting || [];

    return this.products.filter(p => {
        return wanting.some(w => w.item === p.item) && p.qty > 0;
    });
}
    
}

export class MerchantManager {
    constructor() {
        this.merchants = [];
    }

    addMerchant(merchant) {
        this.merchants.push(merchant);
    }

    getMerchants() {
        return this.merchants;
    }

    getMerchantsInCity(cityName) {
        return this.merchants.filter(m => m.city === cityName);
    }

    getMerchantsAvailableToMoveCity (city) {
        const connectedCities = city.connections || [];

        const availableMerchants = this.merchants.filter(m => {
            return m.status === 'wait' && (connectedCities.some(conn => conn.name === m.city));
        });

        return availableMerchants;
    }

    getMerchantByName(name) {
        return this.merchants.find(m => m.name === name);
    }

    setMerchants(merchantDataList) {
        this.merchants = merchantDataList.map(data => {
            const merchant = new Merchant(data.name, data.city);
            merchant.status = data.status;
            merchant.gold = data.gold;
            merchant.products = data.products || [];
            merchant.movingInfo = data.movingInfo || null;

            return merchant;
        });
    }
}