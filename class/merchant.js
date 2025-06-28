export class Merchant {
    constructor(name, city = null) {
        this.name = name;
        this.city = city;
        this.gold = 0;
        this.status = 'wait'; // wait, moving
        this.products = [];
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
            wanting.includes(p.item) && p.qty > 0;
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
            return m.status === 'wait' && 
                   (connectedCities.includes(m.city));
        });

        return availableMerchants;
    }
}