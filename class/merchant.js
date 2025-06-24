export class Merchant {
    constructor(name, city = null) {
        this.name = name;
        this.city = city;
        this.products = [];
    }

    addProduct(product) {
        this.products.push(product);
    }

    changeCity(city) {
        this.city = city;
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
}