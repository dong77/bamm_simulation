class BAMM {

    constructor(F) {
        console.assert(F > 1);
        this.F = F; // amplificaiton factor
        this.lp = 0;
        this.x = 0; // total X balance including virtual
        this.y = 0;
        this.Rx = 0; // real X balance
        this.Ry = 0;
    }

    enabled() {
        return this.x > 0 && this.y > 0;
    }

    _price() {
        return this.y/this.x;
    }

    price() {
        if (!this.enabled()) return 0;
        else return this._price();
    }

    _rebanance(Rx, Ry, p) {
        this.Rx = Rx;
        this.Ry = Ry;

        let _x = this.Rx * this.F;
        let _y = this.Ry * this.F;

        this.x = Math.max(_x, _y/p);
        this.y = this.x * p;
    }

    join(Rx, Ry, price) {
        console.assert(Rx !== 0 || Ry !== 0, 'invalid x or y');

        let p = price;

        if (this.enabled()) {
            p = this._price();
        } else {
            console.assert(p > 0, 'invalid price');
        }

        let mint;
        if (this.lp === 0) {
            mint = Rx*p + Ry;
        } else {
            mint = this.lp * (Rx*p + Ry) / (this.Rx*p + this.Ry);
        }

        this.lp += mint;


        // transfer tokens into the pool

        this._rebanance(this.Rx + Rx, this.Ry + Ry, p)

        return mint;
    }

    exit(lp) {
        console.assert(lp <= this.lp);
        let r = lp / this.lp;
        let Rx = this.Rx * r
        let Ry = this.Ry * r;

         this.join(-Rx, -Ry, 0);
         return [Rx, Ry]
    }

    sellX(Rx) { // buy Ry
        console.assert(this.enabled());
        let _x = this.x + Rx;
        let _y = this.x * this.y / _x;
        let Ry = this.y - _y;
        if (Ry > this.Ry) {
            Ry = this.Ry;
        }

        _y = this.y - Ry;
        _x = this.x * this.y / _y;
        Rx = _x - this.x;

        this.x = _x;
        this.y = _y;


        this._rebanance(this.Rx + Rx, this.Ry - Ry, this._price());

        return [Rx, Ry];
    }


    toString() {
        return `F = ${this.F}, x = ${this.x}, y = ${this.y}, Rx= ${this.Rx}, Ry= ${this.Ry}, p = ${this.price()}, lp = ${this.lp}`;
    }
}


let bamm = new BAMM(2)
let lp;
let amounts;
lp =bamm.join(100.0, 0, 10);
console.log(bamm.toString() + ` -> new LP: ${lp}`)

lp = bamm.join(100.0, 10.0);
console.log(bamm.toString() + ` -> new LP: ${lp}`)

lp = bamm.join(0, 10000);
console.log(bamm.toString() + ` -> new LP: ${lp}`)

amounts = bamm.exit(10000);
console.log(bamm.toString() + ` -> amounts: ${amounts}`)

amounts = bamm.exit(1010);
console.log(bamm.toString() + ` -> amounts: ${amounts}`)

// amounts = bamm.exit(1000);
// console.log(bamm.toString() + ` -> amounts: ${amounts}`)


amounts = bamm.sellX(10);
console.log(bamm.toString() + ` -> sells: ${amounts}`)


amounts = bamm.sellX(-10);
console.log(bamm.toString() + ` -> sells: ${amounts}`)
