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

    join(x, y, price) {
    	console.assert(x !== 0 || y !== 0, 'invalid x or y');

    	let p = price;

    	if (this.enabled()) {
    		p = this._price();
    	} else {
    		console.assert(p > 0, 'invalid price');
    	}

    	let mint;
		if (this.lp === 0) {
    		mint = x*p + y;
    	} else {
    		mint = this.lp * (x*p + y) / (this.Rx*p + this.Ry);
    	}

    	this.lp += mint;


    	// transfer tokens into the pool

    	this._rebanance(this.Rx + x, this.Ry + y, p)

    	return mint;
    }

    exit(lp) {
    	console.assert(lp <= this.lp);
    	let r = lp / this.lp;
    	let x = this.Rx * r
    	let y = this.Ry * r;

 		this.join(-x, -y, 0);
 		return [x, y]
    }

    sellX(x) { // buy y
    	console.assert(this.enabled());
    	let _x = this.x + x;
    	let _y = this.x * this.y / _x;
    	let y = this.y - _y;
    	if (y > this.Ry) {
    		y = this.Ry;
    	}

    	_y = this.y - y;
    	_x = this.x * this.y / _y;
    	x = _x - this.x;

    	this.x = _x;
    	this.y = _y;


		this._rebanance(this.Rx + x, this.Ry - y, this._price());

    	return [x, y];
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
