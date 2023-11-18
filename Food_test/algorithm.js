const fs = require('fs');

const data_path = '../data/results'


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
	.readFileSync(data_path + '/units.txt')
	.toString()
	.split('\n');

	/**
	 * Constructor already agreeing the unit with the hardcoded standard.
	 * @param  {number} value [amount]
	 * @param  {string} unit  Name of the unit.
	 */
	constructor(value, unit) {

		if (typeof value !== 'number') throw Error('Value argument must be a number.');
		if (typeof unit !== 'string') throw Error('Unit must be in the form of a string.');
		if (Amount.units.indexOf(unit) == -1) throw Error('Unknown unit.');

		this.value = value;
		this.unit = unit;

		this.agree();

	}

	/**
	 * Agree the Amount's unit to the hardcoded standard.
	 */
	agree() {

		switch (this.unit) {

		case 'g':
			this.value *= 100;
			this.unit = 'µg';
			break;

		case 'mg':
			this.value *= 10;
			this.unit = 'µg';
			break;

		case 'kcal':
			this.value *= 4.184;
			this.unit = 'kJ';
			break;

		case 'IU': // International Unit
			break;

		case 'sp gr': // specific gravity / relative density
			break;

		}

	}

}


class Recipe {

	static ingredients = JSON.parse(fs.readFileSync(data_path + '/ingredients.json'));

	constructor () {

		this.ingredients = [];
		this.fitness = null;

	}

	randomizeIngredients() {




	}

}


/**
 * MAIN OBJECT OF THE ALGORITHM.
 * @type {Object}
 */
const population = {

	recipes: [],

	size: 10,

	initialize: function () {

		for (i=0; i<this.size; i++) {

			let recipe = new Recipe();
			recipe.randomizeIngredients();
			recipes.push(recipe);

		}


	}

}