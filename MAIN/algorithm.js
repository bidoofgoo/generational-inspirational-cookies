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

	let returnSet = new Set();

	let index = Math.floor(Math.random() * set.size);
	let original = Array.from(set);

	for (let i=0; i< set.size; i++) {

		if (i !== index) returnSet.add(original[i]);

	}

	return returnSet;

	// if (returnSet.size > 0) {

	// 	let randomIndex = Math.floor(Math.random()*returnSet.size);
	// 	let i = 0;
		
	// 	for(let item of returnSet) {
	// 	  if(i === randomIndex) {
	// 		returnSet.delete(item);
	// 		break;
	// 	  }
	// 	  i++;
	// 	}

	// }

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
	static ingredients = this.filterUnusedNutrients(JSON.parse(fs.readFileSync(dataResults_path + '/ingredients_roles2.json')));

	/**
	 * All possible roles an ingredient can serve
	 * within the process of cooking a cookie.
	 */
	static bakingroles = {
		"Base" : 1,
		"Fat" : 1,
		"Sweetener" : 1,
		"Binding Agent" :1,
		"Leavener/Rising agent" : 1,
		"Flavorings": 3,
		"Add-ins" : 3,
		"Seasoning": 3,
		"Texture Enhancers": 1,
		"Decorations/Toppings": 2,
		"Liquid": 1
	};


	/**
	 * Parse recipe for the prototype cookie.
	 *
	 * @param   {[type]}  cookiePrototype  [cookiePrototype description]
	 *
	 * @return  {[type]}                   [return description]
	 */
	static normalizeCookiePrototype(cookiePrototype) {

		console.log(cookiePrototype);

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

		let [r_smaller, r_bigger] = [r1, r2].sort((curr, prev) => curr.ingredients.size > curr.ingredients.size);

		let in_smaller = Array.from(r_smaller.ingredients);
		let in_bigger = Array.from(r_bigger.ingredients);

		for (let i=0; i<in_bigger.length; i++) {

			if (i < in_smaller.length) {

				newRecipe.ingredients.add(i%2===0 ? in_bigger[i] : in_smaller[i]);

			} else {
				
				newRecipe.ingredients.add(in_bigger[i]);

			}
			
		}

		// let i = 0;
		// for(let ingr of r1.ingredients){
		// 	if( i % 2 == 0){
		// 		newRecipe.ingredients.add(ingr)
		// 	}
		// 	i++;
		// }

		// i = 0;
		// for(let ingr of r2.ingredients){
		// 	if( i % 2 == 0){
		// 		newRecipe.ingredients.add(ingr)
		// 	}
		// 	i++
		// }

		return r_bigger;

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

		// console.log(this.ingredients)

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

		let totalfitness = 0;

		let incurrentcookie = {};
		
		// assess baking roles of the ingredients

		for (let ingredient of this.ingredients) {
			for (let role of ingredient.bakingrole) {
				if(!(role in incurrentcookie)) incurrentcookie[role] = 0;
				if(incurrentcookie[role] < Recipe.bakingroles[role])totalfitness++;
				else totalfitness--;
				incurrentcookie[role] += 1;
			}
		}





		// asses similarity to the prototypeCookie.

		return totalfitness;
		
	}

	calcNovelty(population) {
		
		//return 

	}
	
	/**
	 * [mutates the current recipe by either removing, adding 
	 * ,replacing one of the ingredients]
	 *
	 */
	mutate() {
		
		let randint = Math.floor(Math.random() * 4);
		// let additionalCheck = Math.random > 0.5;

		// let curingreds = new Set(this.ingredients)

		let randIngred = Recipe.getRandomIngredient()

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

			default:
				break;
		}

		this.normalizeIngredients()

	}


	toString() {

		let beginStr = `Cookie Recipe - Fitness: ${this.fitness} - Ingredients: ${this.ingredients.size} - `;
		
		let ingredientNames = Array.from(this.ingredients).reduce((ingredients, ingredient) => {
			
			ingredients.push(ingredient.name)

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

	size: 20,

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


	evolve: function (generations) {

		for (let index = 0; index < generations; index++) {
			
			console.log('GENERATION ' + index);

			let R = this.generateRecipes(this.size, this.recipes);
			this.recipes = this.selectPopulation(this.recipes, R);

			//console.log(this.recipes[0]);
			
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

		console.log("Report!:");

		assert(this.recipes.length === this.size, 'There are not enough/too many recipes in a cookbook.');
		
		for (let recipe of this.recipes) {
			
			console.log(recipe.toString());
			console.log();

		}
	}
}

population
.initialize()
.evolve(50)
.report();
