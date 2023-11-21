const assert = require('assert');
const fs = require('fs');

const data_path = 'data'
const dataResults_path = data_path + '/results';

/**
 * An amount of nutrient given by the databases
 * and expressed within units.
 */
class Amount {

	/**
	 * All units derived from the original databases.
	 * @type {[string]}
	 */
	static units = fs
	.readFileSync(dataResults_path + '/units.txt')
	.toString()
	.split(/\r?\n/);

	/**
	 * Constructor already agreeing the unit with the hardcoded standard.
	 * @param  {number} amount [amount]
	 * @param  {string} unit  Name of the unit.
	 */
	constructor(amount=0, unit='µg') {

		assert(typeof amount === 'number', 'Amount argument must be a number.');
		assert(amount !== NaN, 'Amount cannot be NOT A NUMBER (but NaN is a number LOL)...');
		assert(typeof amount === 'number', 'Amount argument must be a number.');
		assert(typeof unit === 'string', 'Unit must be in the form of a string.');
		assert(Amount.units.indexOf(unit) > -1, 'Unknown unit.');

		this.amount = amount;
		this.unit = unit;

		this.agree();

	}

	/**
	 * Agree the Amount's unit to the hardcoded standard.
	 */
	agree() {

		switch (this.unit) {

		case 'g':
			this.amount *= 100;
			this.unit = 'µg';
			break;

		case 'mg':
			this.amount *= 10;
			this.unit = 'µg';
			break;

        case 'µg':
            break;

		case 'kcal':
			this.amount *= 4.184;
			this.unit = 'kJ';
			break;

		case 'IU': // International Unit
			break;

		case 'sp gr': // specific gravity / relative density
			break;

		default:
			throw Error(`Provided unsupported unit ${this.unit}`);

		}

	}

	/**
	 * Add another Amount object.
	 * @param {Amount} amount [description]
	 */
	add(amount) {

		assert(amount instanceof Amount, 'amount must be of type Amount.');
		assert(this.unit === amount.unit, `the added amount (in ${amount.unit}) must be of the same unit (${this.unit})`);

		this.amount += amount.amount;

		return this;

	}


	normalize(initialTotalAmount, normalizedTotalAmount) {

		assert(initialTotalAmount instanceof Amount, 'initialAmount must be of type Amount.')
		assert(normalizedTotalAmount instanceof Amount, 'normalizedAmount must be of type Amount.')
		assert(initialTotalAmount.unit === normalizedTotalAmount.unit, 'Both amounts must have the same unit!')

		let newAmount = this.amount * normalizedTotalAmount.amount / initialTotalAmount.amount;

		this.amount = newAmount;

		return this;

	}

	toString() {
        if(this.unit == "µg"){
            if(this.amount > new Amount(1, "g").amount) return `${Math.round(this.amount/100)}g`;
            else if(this.amount > new Amount(1, "mg").amount) return `${Math.round(this.amount/10)}mg`;
        }
		 
		return `${this.amount}${this.unit}`
	}

	copy() {
		return new Amount(this.amount, this.unit);
	}

}

module.exports = Amount;