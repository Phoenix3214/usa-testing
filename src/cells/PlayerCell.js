const Cell = require("./Cell");

// Variables... Just a test

var boost = 0.5;
var delayInMilliseconds = 10000;

class PlayerCell extends Cell {
    /**
     * @param {Player} owner
     * @param {number} x
     * @param {number} y
     * @param {number} size
     * @param {number} color
     */
    constructor(owner, x, y, size) {
        super(owner.world, x, y, size, owner.cellColor);
        this.owner = owner;
        this.name = owner.cellName || "";
        this.skin = owner.cellSkin || "";
        this._canMerge = false;
        this._canEat = false;
    }

    get moveSpeed() {
        return 88 * Math.pow(this.size, -0.4396754) * this.owner.settings.playerMoveMult;
    }
    get canMerge() { return this._canMerge; }
    get canEat() { return this._canEat; }

    get type() { return 0; }
    get isSpiked() { return false; }
    get isAgitated() { return false; }
    get avoidWhenSpawning() { return true; }

    /**
     * @param {PlayerCell|Cell} other
     * @returns {CellEatResult}
     */
    getEatResult(other) {
        if (other.type === 0) {
            const delay = this.world.settings.playerNoCollideDelay;
            if (other.owner.id === this.owner.id) {
                if (other.age < delay || this.age < delay) return 0;
                if (this.canMerge && other.canMerge) return 2;
                return 1;
            }
            if (other.owner.team === this.owner.team && this.owner.team !== null)
                return (other.age < delay || this.age < delay) ? 0 : 1;
            return this.getDefaultEatResult(other);
        }
        if (other.type === 4 && other.size > this.size * 1.140175425099138) return 3;
        if (other.type === 1) return 2;
        return this.getDefaultEatResult(other);
      
      
    }
  
  
  
    /** @param {Cell} other */
  getDefaultEatResult (other, router) {
        const delay = this.world.settings.playerNoCollideDelay;
       const settings = this.world.settings;
        if (other.type === 1) {
        const newD = this.boost.d + boost*50000000000000000000000;
        this.boost.dx = (this.boost.dx * this.boost.d + other.boost.dx * boost /* change value for different boosts */) / newD;
        this.boost.dy = (this.boost.dy * this.boost.d + other.boost.dy * boost) / newD;
        this.boost.d = newD;
        this.world.setCellAsBoosting(this);
        return other.size * 1.140175425099138 > this.size ? 0 : 2; 
     
  
    } 
     if (other.type === 3 || this.age < 500) { // no boost if the eaten cell is virus, pellet or playercell
     return other.size * 1.140175425099138 > this.size ? 0 : 2;  
      
     }
    else { // no boost if the eaten cell is virus, pellet or playercell
     return other.size * 1.140175425099138 > this.size ? 0 : 2;  
      
   } 

}
  
  
    onTick() {
        super.onTick();

        if (this.name !== this.owner.cellName)
            this.name = this.owner.cellName;
        if (this.skin !== this.owner.cellSkin)
            this.skin = this.owner.cellSkin;
        if (this.color !== this.owner.cellColor)
            this.color = this.owner.cellColor;

        const settings = this.world.settings;
        let delay = settings.playerNoMergeDelay;
        if (settings.playerMergeTime > 0) {
            let mergeDelay;
            const initial = Math.round(25 * settings.playerMergeTime);
            const increase = Math.round(25 * this.mass * settings.playerMergeTimeIncrease);
            if (settings.playerMergeVersion === "old") mergeDelay = initial + increase;
            else mergeDelay = Math.max(initial, increase);
            delay = Math.max(delay, mergeDelay);
        }
        this._canMerge = this.age >= delay;
    }

    onSpawned() {
        this.owner.router.onNewOwnedCell(this);
        this.owner.ownedCells.push(this);
        this.world.playerCells.unshift(this);
    }

    onRemoved() {
        this.world.playerCells.splice(this.world.playerCells.indexOf(this), 1);
        this.owner.ownedCells.splice(this.owner.ownedCells.indexOf(this), 1);
        this.owner.updateState(-1);
    }
}

module.exports = PlayerCell;

const Player = require("../worlds/Player");
