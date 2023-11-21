const assert = require('assert');
const { log } = require('console');
const fs = require('fs');

const data_path = 'data'
const dataResults_path = data_path + '/results';


/**
 * [Returns a set based on its given parameter but with 1 random element dropped]
 *
 * @return  {[Set]}  [New set, based off parameter set but with 1 random element dropped is returned]
 */
function deleteRandomElementFromSet(set) {

	let returnSet = new Set();

	let originalsize = set.size;

	let index = Math.floor(Math.random() * set.size);
	let original = Array.from(set);

	for (let i=0; i < set.size; i++) {

		if (i !== index) returnSet.add(original[i]);

	}

	assert(originalsize > returnSet.size, `The returning set size ${returnSet.size} should be less than ${originalsize}`)

	return returnSet;

}

/**
 * [Returns a random item from a set]
 *
 * @return  {[???]}  [returns one of whatever the set is filled with]
 */
function getRandomItemFromSet(set) {
    let items = Array.from(set);
    return items[Math.floor(Math.random() * items.length)];
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


	normalize(initialTotalAmount, normalizedTotalAmount) {

		assert(initialTotalAmount instanceof Amount, 'initialAmount must be of type Amount.')
		assert(normalizedTotalAmount instanceof Amount, 'normalizedAmount must be of type Amount.')
		assert(initialTotalAmount.unit === normalizedTotalAmount.unit, 'Both amounts must have the same unit!')

		let newAmount = this.amount * normalizedTotalAmount.amount / initialTotalAmount.amount;

		this.amount = newAmount;

		return this;

	}

	toString() {
		if(this.unit == "µg") return `${Math.round(this.amount/100)}g`;
	}

	copy() {
		return new Amount(this.amount, this.unit);
	}

}

/**
 * [Recipe description]
 */
class Recipe {

	/**
	 * Nutrients are normalized per 100g of the cookie for the doe
	 * (or how much does the doe weights!)
	 */
	static portion = new Amount(100, 'g');

	/**
	 * This is the cookie we want our cookies to approach
	 * by its nutrients.
	 * 
	 * Original has nutrients for 45 g (one cookie).
	 */
	static cookiePrototypeData = this.normalizeCookiePrototype(JSON.parse(fs.readFileSync(data_path + '/red_velvet_nutrients.json')));

	/**
	 * All ingredients assembled from 'food' databases
	 * (made by 'knowledgebase.js').
	 */
	static ingredients = this.filterUnusedData(JSON.parse(fs.readFileSync(dataResults_path + '/ingredients_roles2.json')));

	/**
	 * All possible roles an ingredient can serve
	 * within the process of cooking a cookie.
	 */
	static bakingroles = {

		"Base" : new Amount(25, "g"),
		"Fat" : new Amount(15, "g"),
		"Sweetener" : new Amount(15, "g"),
		"Binding Agent" :new Amount(10, "g"),
		"Leavener/Rising agent" : new Amount(5, "g"),
		"Flavorings": new Amount(5, "g"),
		"Add-ins" : new Amount(10, "g"),
		"Seasoning": new Amount(2, "g"),
		"Texture Enhancers": new Amount(5, "g"),
		"Decorations/Toppings": new Amount(3, "g"),
		"Liquid": new Amount(5, "g")

	};


	/**
	 * Parse recipe for the prototype cookie.
	 *
	 * @param   {[type]}  cookiePrototype  [cookiePrototype description]
	 *
	 * @return  {[type]}                   [return description]
	 */
	static normalizeCookiePrototype(cookiePrototype) {

		// calculate initial total amount
		let initialTotalAmount = new Amount();

		// change 'amount' and 'unit' keys to Amount instance.
		for (let nutrient in cookiePrototype) {

			let amount = new Amount(cookiePrototype[nutrient].amount, cookiePrototype[nutrient].unit);
			
			initialTotalAmount.add(amount);
			
			cookiePrototype[nutrient].amount = amount;
			delete cookiePrototype[nutrient].unit; // not needed anymore.

		}

		// calculate post-normalization total amount for assertion
		let finalTotalAmount = new Amount();

		// normalize amounts to one portion!
		for (let nutrient in cookiePrototype) {

			cookiePrototype[nutrient].amount.normalize(initialTotalAmount, this.portion);

			finalTotalAmount.add(cookiePrototype[nutrient].amount);
g
		}

		assert(
			this.portion.amount === finalTotalAmount.amount,
			`The current portion ${finalTotalAmount} does not sum to to ${this.portion} normalized portion amount.`)

		return cookiePrototype

	}

	/**
	 * Remove ~IN PLACE~ all the nutrients that are not mentioned in cookiePrototypeData.
	 * In practice, there are some 'classes' of nutrients aggregating other classes
	 * i.e. 'TotalCarbohydrates' sum up all the nutrients that are classified as carbs
	 * (by the dataset creators, not us).
	 */
	static filterUnusedData(ingredients) {

		// get a set of all nutrients mentioned in cookiePrototypeData.
		let nutrientsUsed = new Set();

		// filter out ingredients which do not have one of the main ingredient aliases.
		for (let nutrientName in this.cookiePrototypeData) {

			for (let nutrientAlias of this.cookiePrototypeData[nutrientName].innutrients) {
				nutrientsUsed.add(nutrientAlias);
			}

		}

		// filter out nutrients without main nutrients.
		for (let ingredient of ingredients) {

			ingredient.nutrients = ingredient.nutrients.filter(nutrient => nutrientsUsed.has(nutrient.name))
		
		}

		// filter out some categories...
		ingredients = ingredients.filter(ingredient => !ingredient.category.includes('sandwich'));
		ingredients = ingredients.filter(ingredient => ingredient.category !== 'Liquid');

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

		for (let recipe of [r1,r2]) {

			let ingredients = Array.from(recipe.ingredients).sort(() => 0.5 - Math.random());
			
			for (let i=0; i<Math.ceil(ingredients.length/2); i++) {

				let ingrToAdd = {...ingredients[i]}
				ingrToAdd.amount = ingrToAdd.amount.copy();
				
				let ingredAlreadyExists = false;
				
				for (let ingred of newRecipe.ingredients) {

					if (ingred.name === ingrToAdd.name) {
						ingred.amount.add(ingrToAdd.amount);
						ingredAlreadyExists = true;
						break;
					}

				}
				
				if (!ingredAlreadyExists) newRecipe.ingredients.add(ingrToAdd)
				
			}

		}

		newRecipe.normalizeIngredients()

		return newRecipe;

	}


	constructor () {

		this.ingredients = new Set(); // what about weight???
		this.novelty = 0;

	}


	randomizeInitialIngredients() {

		while (this.ingredients.size < 10) {

			this.ingredients.add(Recipe.getRandomIngredient());

		}

		this.normalizeIngredients();

		//this.calcNutrients();

		this.amountPerCategory // R E M O V E

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

		assert(this.ingredients.size > 0,
			`The recipe has no ingredients, nothing to normalize?`)
		
		let total = this.totalAmount();



		// new amount = portion amount * given ingredient amount / total amount.
		for (let ingredient of this.ingredients) {

			ingredient.amount = new Amount(Recipe.portion.amount * ingredient.amount.amount / total.amount);

		}

		let currentAmount = Math.round(this.totalAmount().amount);
		let normalizedAmount = Math.round(Recipe.portion.amount);

		assert(
			currentAmount === normalizedAmount,
			`The current portion ${currentAmount} does not sum to to ${normalizedAmount} normalized portion amount.`)
		
	}


	get nutrients() {
		// This is incorrect for now
		// Only after the ingredients have been normalized

		if(this.totalNutrients != null) return this.totalNutrients;
		this.totalNutrients = {};

		for (let ingredient of this.ingredients) {

			for (let nutrient of ingredient.nutrients) {

				let amount = new Amount(nutrient.amount, nutrient.unit);
				let portion = Recipe.portion.amount;
				let ingredAmount = ingredient.amount.amount;

				// normalization
				amount.amount = (amount.amount * ingredAmount) / portion;
				
				if (nutrient.name in this.totalNutrients) {

					this.totalNutrients[nutrient.name].add(amount);

				} else {

					this.totalNutrients[nutrient.name] = amount;

				}
			}

		}

		return this.totalNutrients;

	}

	get amountPerCategory() {

		let amounts = {}

		for (let role in Recipe.bakingroles) {
			
			amounts[role] = new Amount();

		}

		for (let ingredient of this.ingredients) {

			for (let role of ingredient.bakingrole) {

				amounts[role].add(ingredient.amount);

			}

		}

		return amounts;

	}


	get fitness() {	

		let totalfitness = 0;

		// let incurrentcookie = {};
		
		// assess baking roles of the ingredients
		// for (let ingredient of this.ingredients) {
		// 	for (let role of ingredient.bakingrole) {
		// 		if(!(role in incurrentcookie)) incurrentcookie[role] = 0;
		// 		if(incurrentcookie[role] < Recipe.bakingroles[role])totalfitness+= 10;
		// 		else totalfitness = Math.max(totalfitness - 10, 0);
		// 		incurrentcookie[role] += 1;
		// 	}
		// }

		// FITNESS I – by amount per category
		let amountPerCategory = this.amountPerCategory

		// refer to Recipe.bakingroles for the 'expected' amount
		let differencePerCategory = {}

		for (let category in Recipe.bakingroles) {

			let expectedAmount = Recipe.bakingroles[category].amount;
			let currentAmount = amountPerCategory[category].amount;

			differencePerCategory[category] = Math.max(1 - Math.abs(expectedAmount - currentAmount) / (expectedAmount * 2), 0);

			totalfitness += differencePerCategory[category];

		}

		// FITNESS II – by similarity to prototype cookie.

		let differencePerNutrient = {}

		for (let nutrient in Recipe.cookiePrototypeData) {

			if (nutrient in this.nutrients) {

				let expectedAmount = Recipe.cookiePrototypeData[nutrient].amount.amount;
				let currentAmount = this.nutrients[nutrient].amount;

				differencePerNutrient[nutrient] = Math.max(1 - Math.abs(expectedAmount - currentAmount) / (expectedAmount * 2), 0);

				totalfitness += differencePerNutrient[nutrient];

			} else {

				totalfitness /= 0.666;

			}
				
		}

		return totalfitness;
		
	}

	calcNovelty(population) {
		
		// First see how many of what ingredient of this recipe exists in the population. Then based on that number;
		let ingredientsInPop = {}

		for (let ingredient of this.ingredients) {

			if(!ingredient.name in ingredientsInPop)ingredientsInPop[ingredient.name]=0;

			for (let recipe of population) {

				if(recipe.name == ingredient.name) ingredientsInPop[ingredient.name]++;

			}
		}
		

	}
	
	/**
	 * [mutates the current recipe by either removing, adding 
	 * ,replacing one of the ingredients]
	 *
	 */
	mutate() {
		
		let randint = Math.floor(Math.random() * 6);
		// let additionalCheck = Math.random > 0.5;

		// let curingreds = new Set(this.ingredients)

		let randIngred = Recipe.getRandomIngredient();

		let ingr = getRandomItemFromSet(this.ingredients);

		// console.log(this.ingredients)

		switch (randint) {
			
			case 0:
				if (this.ingredients.size > 1) {
					this.ingredients = deleteRandomElementFromSet(this.ingredients);
				} //finish
				break;

			case 1:
				this.ingredients.add(randIngred);
				break;

			case 2:
				if (this.ingredients.size > 0) {
					this.ingredients = deleteRandomElementFromSet(this.ingredients);
				}
				this.ingredients.add(randIngred);
				break;
			case 3:
				ingr.amount.amount = ingr.amount.amount * (1 + Math.random() * 9);
				break;
			case 4:
				ingr.amount.amount = ingr.amount.amount * (0.1 + Math.random() * 0.9);
				break;
			default:
				break;
		}

		this.normalizeIngredients()

	}


	toString() {

		let beginStr = `Cookie Recipe - Fitness: ${this.fitness} - Ingredients: ${this.ingredients.size} - `;
		
		let ingredientNames = Array.from(this.ingredients).reduce((ingredients, ingredient) => {
			
			ingredients.push(ingredient.amount.toString() + " " + ingredient.name)

			return ingredients;

		}, []);

		beginStr += ingredientNames.join(", ");

		return beginStr;
	}
	
}


/**
 * MAIN OBJECT OF THE ALGORITHM.
 * @type {Object}
 */
const population = {

	recipes: [],

	size: 150,

	history: [],

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
			r.mutate();							// mutation
			r.mutate();							// mutation
			r.mutate();							// mutation
	
			R.push(r);
	
		}
	
		this.evaluateRecipes(R);
	
		return R;
	
	},

	evaluateRecipes: function (recipes) {

		for (const recipe of recipes) {
			
			//recipe.fitness;
			//recipe.calcNovelty();

		}
	
	},

	selectRecipe: function (recipes) {

		// calculate the fitness
		let sum = this.recipes.reduce((a, r) => a + r.fitness, 0);
		let fitness = Math.floor(Math.random() * sum);
	
		// cheap randomisation using hash table unpredictability.
		for (const recipe of recipes) {
			if (fitness < recipe.fitness) return recipe;
			fitness -= recipe.fitness;
		}
	
		// emergency: return last if no one is fit enough.
		return recipes[recipes.length - 1];
	
	},

	evolve: function (generations) {

		for (let index = 0; index < generations; index++) {
			
			let R = this.generateRecipes(this.size, this.recipes);
			this.recipes = this.selectPopulation(this.recipes, R);

			console.log('GENERATION ' + index + ": Max fitness: " + this.recipes[0].fitness);

			//console.log(this.recipes[0]);
			
		}

		return this;
	
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

		console.log("\nReport!:\n");

		assert(this.recipes.length === this.size, `Got ${this.recipes.length} recipes, expected ${this.size}...`);

		for (let i=0; i<3; i++) {

			let recipe = this.recipes[i]
			console.log(recipe.toString());
			console.log();
			
		}
	}
}

population
.initialize()
.evolve(500)
.report();
// console.log('\nEvolution TURNED OFF.\n')
