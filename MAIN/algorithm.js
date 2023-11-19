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
	constructor(amount, unit) {

		assert(typeof amount === 'number', 'Amount argument must be a number.');
		assert(typeof amount === 'number', 'Amount argument must be a number.');
		assert(typeof unit === 'string', 'Unit must be in the form of a string.');
		assert(Amount.units.indexOf(unit) > -1, 'Unknown unit.');

		this.amount = amount;
		this.unit = unit ?? 'µg';

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


/**
 * [Recipe description]
 */
class Recipe {

	/**
	 * All ingredients assembled from 'food' databases
	 * (made by 'knowledgebase.js').
	 */
	static ingredients = this.filterUnusedNutrients(JSON.parse(fs.readFileSync(dataResults_path + '/ingredients_roles.json')));
	
	/**
	 * How much one portion of this recipe weights.
	 */
	static portion = Amount(100, 'g');

	/**
	 * This is the cookie we want our cookies to approach
	 * by its nutrients.
	 */
	static cookiePrototypeData = JSON.parse(fs.readFileSync(data_path + "/red_velvet_nutrients.json"));

	/**
	 * Nutrients are normalized per 100g of the cookie.
	 */
	static normalization = new Amount(100, 'g');

	/**
	 * All possible roles an ingredient can serve
	 * within the process of cooking a cookie.
	 */
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

	/**
	 * Remove _in place_ all the nutrients that are not mentioned in cookiePrototypeData.
	 * In practice, there are some 'classes' of nutrients aggregating other classes
	 * i.e. 'TotalCarbohydrates' sum up all the nutrients that are classified as carbs
	 * (by the dataset creators, not us).
	 */
	static filterUnusedNutrients () {

		// get set of all nutrients mentioned in cookiePrototypeData.
		let used_nutrients = this.cookiePrototypeData.reduce((ingredients, data) => {

			for (let nutrient in data.innutrients) ingredients.add(nutrient);
			
		}, new Set());

		// from each ingredient, remove those nutrients that are not mentioned in used_nutrients.
		for (let nutrient in this.ingredients.nutrients) {

			if (this.ingredients.nutrients[nutrient].name in used_nutrients) {

				this.ingredients.nutrients[nutrient] = undefined;

			}

		}

	}

	/**
	 * [Crossover two recipes into a new child recipe]
	 *
	 * @param   {[Recipe]}  r1  [parent 1]
	 * @param   {[Recipe]}  r2  [parent 2]
	 *
	 * @return  {[Recipe]}      [child]
	 */
	static crossover(r1, r2){

		let newRecipe = new Recipe();

		let i = 0;
		for(let ingr in r1.ingredients){
			if( i % 2 == 0){
				newRecipe.ingredients.add(ingr)
			}
			i++;
		}

		i = 0;
		for(let ingr in r2.ingredients){
			if( i % 2 == 0){
				newRecipe.ingredients.add(ingr)
			}
			i++
		}

		return newRecipe;
	}


	constructor () {

		this.ingredients = new Set(); // what about weight???
		this.nutrients = {};
		this.fitness = 0;
		this.novelty = 0;

	}


	randomizeIngredients() {

		let maxInitialWeight = 100;

		while (this.ingredients.size < 10) {

			let randomId = Math.floor(Recipe.ingredients.length * Math.random());
			let ingredient = Recipe.ingredients[randomId];

			ingredient.amount = Amount(Math.random() * maxInitialWeight, 'g');

			this.ingredients.add(ingredient);

		}

		this.normalizeIngredients();

		this.calcNutrients();

	}


	get totalAmount() {

		return this.ingredients.reduce((amount, ingredient) => amount.add(ingredient.amount), Amount(0, 'g'));

	}

	/**
	 * Normalize ingredients' amounts to a recipe portion.
	 */
	normalizeIngredients() {
		
		let totalAmount = this.totalAmount;
		
		// newamount = portion * cur ingred amount / totalamount
		for (let ingredient in this.ingredients) {

			ingredient.amount = new Amount(Recipe.portion.amount * ingredient.amount.amount / totalAmount.amount);

		}
		
		let newTotal = this.totalAmount
		assert(Math.round(this.totalAmount.amount) == Math.round(this.portion.amount))
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

	calcNovelty(population){
		
	}
	
	/**
	 * [mutates the current recipe by either removing, adding 
	 * ,replacing one of the ingredients]
	 *
	 */
	mutate(){
		
		let randint = Math.floor(Math.random() * 4);

		let curingreds = new Set(this.ingredients)
		let randIngred = Recipe.ingredients[Math.floor(Math.random() * Recipe.ingredients.length)]

		switch(randint){
			case 0:
				if(curingreds.size > 0){
					curingreds = deleteRandomElementFromSet(curingreds);
				}//finish
				break;
			case 1:
				this.ingredients.add(randIngred);
				break;
			case 2:
				if(curingreds.size > 0){
					curingreds = deleteRandomElementFromSet(curingreds);
				}
				this.ingredients.add(randIngred);
				break;
			default:
				break;
		}
		
		this.ingredients = curingreds;
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

/**
 * [Returns a set based on its given parameter but with 1 random element dropped]
 *
 * @return  {[Set]}  [New set, based off parameter set but with 1 random element dropped is returned]
 */
function deleteRandomElementFromSet(set) {
	let returnSet = new Set(set);
	if (returnSet.size > 0) {
		let randomIndex = Math.floor(Math.random()*returnSet.size);
		let i = 0;
		
		for(let item of returnSet) {
		  if(i === randomIndex) {
			returnSet.delete(item);
			break;
		  }
		  i++;
		}
	}
	return returnSet;
  }