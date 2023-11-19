const assert = require('assert');
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
	 * @param  {number} amount [amount]
	 * @param  {string} unit  Name of the unit.
	 */
	constructor(amount, unit) {

		assert(typeof amount === 'number', 'Amount argument must be a number.');
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

		case 'kcal':
			this.amount *= 4.184;
			this.unit = 'kJ';
			break;

		case 'IU': // International Unit
			break;

		case 'sp gr': // specific gravity / relative density
			break;

		}

	}

	/**
	 * Add another Amount object.
	 * @param {Amount} amount [description]
	 */
	add(amount) {

		if (!(amount instanceof Amount)) throw Error('amount must be of type Amount.');

		if (this.unit != amount.unit) throw Error(`the added amount (in ${amount.unit}) must be of the same unit (${this.unit})`);

		this.value += amount.value;

	}

}


class Recipe {

	static ingredients = JSON.parse(fs.readFileSync(data_path + '/ingredients_roles.json'));
	
	static normalization = new Amount(100, 'g');

	static bakingroles = [
		"Base",
		"Binding Agent",
		"Leavening Agent",
		"Fat",
		"Sweetener",
		"Flavorings",
		"Add-ins",
		"Seasoning",
		"Texture Enhancers",
		"Decorations/Toppings",
		"Liquid",
		"Chemical Leaveners"
	];


	constructor () {

		this.ingredients = new Set(); // what about weight???
		this.nutrients = {};
		this.fitness = null;

	}


	randomizeIngredients() {

		while (this.ingredients.size < 10) {

			let randomId = Math.floor(Recipe.ingredients.length * Math.random());
			let ingredient = Recipe.ingredients[randomId];

			this.ingredients.add(ingredient);

		}

		//console.log(this.ingredients);

	}


	calcNutrients() {

		for (let ingredient of this.ingredients) {

			for (let nutrient of ingredient.nutrients) {

				if (nutrient.name in this.nutrients) {

					let amount = new Amount(nutrient.amount, nutrient.unit);
					this.nutrients[nutrient.name].add(amount);

				} else {

					this.nutrients[nutrient.name] = new Amount(nutrient.amount, nutrient.unit);

				}

			}

		}




	}


	calcFitness() {	

	}

}

let test = new Recipe();
test.randomizeIngredients();
test.calcNutrients();


/**
 * MAIN OBJECT OF THE ALGORITHM.
 * @type {Object}
 */
const population = {

	recipes: [],

	size: 10,

	initialize: function () {

		for (let i=0; i<this.size; i++) {

			let recipe = new Recipe();
			recipe.randomizeIngredients();
			recipes.push(recipe);

		}


	}

}