export class Gold {
    constructor(amount) {
        this.gold = amount || 0;
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
}