const assert = require('assert');
const fs = require('fs');

const data_path = 'data'
const dataResults_path = data_path + '/results';


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

function ttt (set) {

	assert(set instanceof Set, "Argument must be a Set.");

}


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
	constructor(amount, unit='µg') {

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

		assert(amount instanceof Amount, 'amount must be of type Amount.');

		assert(this.unit === amount.unit, `the added amount (in ${amount.unit}) must be of the same unit (${this.unit})`);

		this.amount += amount.amount;

		return this;

	}

}

/**
 * [Recipe description]
 */
class Recipe {

	/**
	 * This is the cookie we want our cookies to approach
	 * by its nutrients.
	 */
	static cookiePrototypeData = JSON.parse(fs.readFileSync(data_path + '/red_velvet_nutrients.json'));

	/**
	 * All ingredients assembled from 'food' databases
	 * (made by 'knowledgebase.js').
	 */
	static ingredients = this.filterUnusedNutrients(JSON.parse(fs.readFileSync(dataResults_path + '/ingredients_roles.json')));
	
	/**
	 * Nutrients are normalized per 100g of the cookie for the doe
	 * (or how much does the doe weights!)
	 */
	static portion = new Amount(100, 'g');

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
	 * Remove ~IN PLACE~ all the nutrients that are not mentioned in cookiePrototypeData.
	 * In practice, there are some 'classes' of nutrients aggregating other classes
	 * i.e. 'TotalCarbohydrates' sum up all the nutrients that are classified as carbs
	 * (by the dataset creators, not us).
	 */
	static filterUnusedNutrients(ingredients) {

		// get a set of all nutrients mentioned in cookiePrototypeData.
		let nutrientsUsed = new Set();

		for (let nutrientName in this.cookiePrototypeData) {

			for (let nutrientAlias of this.cookiePrototypeData[nutrientName].innutrients) {
				nutrientsUsed.add(nutrientAlias);
			}

		}

		for (let ingredient of ingredients) {

			ingredient.nutrients = ingredient.nutrients.filter(nutrient => nutrientsUsed.has(nutrient.name))

		}

		return ingredients;

	}

	static getRandomIngredient() {

		let randomId = Math.floor(this.ingredients.length * Math.random());
		let ingredient = {...this.ingredients[randomId]};

		// add 'amount' property to know how much of ingredient we randomly add.
		ingredient.amount = new Amount(this.portion.amount * Math.random());

		return ingredient;

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
		this.novelty = 0;

	}


	randomizeInitialIngredients() {

		while (this.ingredients.size < 10) {

			this.ingredients.add(Recipe.getRandomIngredient());

		}

		this.normalizeIngredients();

		this.calcNutrients();

	}


	totalAmount() {

		return Array.from(this.ingredients).reduce((amount, ingredient) => {

			amount.add(ingredient.amount)

			return amount;
		
		}, new Amount(0, 'g'));

	}

	/**
	 * Normalize ingredients' amounts to a recipe portion.
	 */
	normalizeIngredients() {
		
		let total = this.totalAmount();

		// new amount = portion amount * given ingredient amount / total amount.
		for (let ingredient of this.ingredients) {

			ingredient.amount = new Amount(Recipe.portion.amount * ingredient.amount.amount / total.amount);

		}

		console.log(this.ingredients)

		let currentAmount = Math.round(this.totalAmount().amount);
		let normalizedAmount = Math.round(Recipe.portion.amount);

		assert(
			currentAmount === normalizedAmount,
			`The current portion ${currentAmount} does not sum to to ${normalizedAmount} normalized portion amount.`)
		
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

	get fitness() {	

		let incurrentcookie = new Set();
		
		for (let role of Recipe.bakingroles) {
			
			for (let ingredient of this.ingredients) {
				for (let ingredrole of ingredient.bakingrole) {
					incurrentcookie.add(ingredrole)
				}
			}

		}

		return incurrentcookie.size
		
	}

	calcNovelty(population) {
		
		return 

	}
	
	/**
	 * [mutates the current recipe by either removing, adding 
	 * ,replacing one of the ingredients]
	 *
	 */
	mutate() {
		
		let randint = Math.floor(Math.random() * 4);

		let curingreds = new Set(this.ingredients)
		let randIngred = Recipe.getRandomIngredient()

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

		this.normalizeIngredients()
	}
}


/**
 * MAIN OBJECT OF THE ALGORITHM.
 * @type {Object}
 */
const population = {

	recipes: [],

	size: 100,

	/**
	 * Initialize population e
	 *
	 * @return  {[type]}  [return description]
	 */
	initialize: function () {

		for (let i=0; i<this.size; i++) {

			let recipe = new Recipe();
			recipe.randomizeInitialIngredients();
			this.recipes.push(recipe);

		}

		return this;
		
	},


	generateRecipes: function(size, population) {

		let R = []; // generated recipes
	
		while (R.length < size) {
	
			// select two recipes based on fitness:
			let r1 = this.selectRecipe(population);
			let r2 = this.selectRecipe(population);
	
			// apply modifications
			let r = Recipe.crossover(r1, r2);	// crossover
			//r.mutate();					// mutation
	
			R.push(r);
	
		}
	
		this.evaluateRecipes(R);
	
		return R;
	
	},

	evaluateRecipes: function (recipes) {

		for (const recipe of recipes) {
			
			//recipe.fitness;
			recipe.calcNovelty();

		}
	
	},

	selectRecipe: function (recipes) {

		// calculate the fitness
		let sum = this.recipes.reduce((a, r) => a + r.fitness, 0);
		let fitness = Math.floor(Math.random * sum);
	
		// cheap randomisation using hash table unpredictability.
		for (const recipe of recipes) {
			if (fitness < recipe.fitness) return r;
			fitness -= recipe.fitness;
		}
	
		// emergency: return last if no one is fit enough.
		return recipes[recipes.length - 1];
	
	},


	evolve : function(generations) {

		for (let index = 0; index < generations; index++) {
			
			console.log('GENERATION ' + index);

			let R = this.generateRecipes(this.size, this.recipes);
			this.recipes = this.selectPopulation(this.recipes, R);
			
		}

		return this;
	
		// history.push(population[0].fitness);
	
		// console.log("max. fitness = " + history[history.length - 1]);
	
		// let recipe_text = population[0].name + "\n";
		// for (let i of population[0].ingredients) {
		// 	recipe_text += "\n" + i.amount + i.unit + " " + i.ingredient;
		// }
	
		// console.log(recipe_text);
	
	},

	selectPopulation: function(P /* Already sorted!!! */, R) {

		// sort new generation R.
		R.sort((a, b) => b.fitness - a.fitness);
	
		// concatenate fittest individuals from P and R.
		P = P.slice(0, P.length/2).concat(R.slice(0, R.length/2));
	
		// sort the 'new' population
		P.sort((a, b) => b.fitness - a.fitness);
	
		return P;
	
	},


	report: function() {
		
		for (recipe of this.recipes) {
			
			//console.log(recipe);

		}

	}

}

population
.initialize()
.evolve(50)
.report();
