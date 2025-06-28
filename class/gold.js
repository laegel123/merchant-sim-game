export class Gold {
    constructor(amount) {
        this.myGold = amount || 0;
        this.totalGold = amount || 0;
    }

    addMyGold(amount) {
        this.myGold += amount;
    }

    subtractMyGold(amount) {
        if (this.myGold >= amount) {
            this.myGold -= amount;
        } else {
            console.warn("Not enough gold to subtract the specified amount.");
        }
    }

    getMyGold() {
        return this.myGold;
    }

    addTotalGold(amount) {
        this.totalGold += amount;
    }

    subtractTotalGold(amount) {
        if (this.totalGold >= amount) {
            this.totalGold -= amount;
        } else {
            console.warn("Not enough gold to subtract the specified amount.");
        }
    }

    getTotalGold() {
        return this.totalGold;
    }
}