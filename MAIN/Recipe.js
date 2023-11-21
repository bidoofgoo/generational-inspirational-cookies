const Amount = require('./Amount.js')
const assert = require('assert');
const { log } = require('console');
const fs = require('fs');

const data_path = 'data'
const dataResults_path = data_path + '/results';

/**
 * [Returns a random item from a set]
 *
 * @return  {[???]}  [returns one of whatever the set is filled with]
 */
function getRandomItemFromSet(set) {
    let items = Array.from(set);
    return items[Math.floor(Math.random() * items.length)];
}

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
	static ingredients = this.filterUnusedData(JSON.parse(fs.readFileSync(dataResults_path + '/ingredients_roles3.json')));

	/**
	 * All possible roles an ingredient can serve
	 * within the process of cooking a cookie.
	 */
	static bakingroles = {
		"Base/Flour" : new Amount(25, "g"),
		"Fat/Oil/Butter" : new Amount(15, "g"),
		"Sweetener" : new Amount(15, "g"),
		"Binder/Egg/Fruit/Yoghurt" :new Amount(10, "g"),
		"Leavener/Rising/Soda" : new Amount(5, "g"),
		"Flavorings": new Amount(5, "g"),
		"Add-ins" : new Amount(10, "g"),
		"Seasoning": new Amount(2, "g"),
		"Texture Enhancers": new Amount(5, "g"),
		"Decorations/Toppings": new Amount(3, "g"),
		"Liquid": new Amount(5, "g")};


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

		ingredients = ingredients.filter(ingredient => ingredient.name.split(" ").length < 3);

		// filter out some categories...
		let overarchingThemesToDrop = [
			'sandwich',
			'dish',
			'burger',
			"energy drink",
			"dressing",
			"cookie",
			"formula",
			"NFS",
			"NS"
		]

		for (let dropping of overarchingThemesToDrop) {
			ingredients = ingredients.filter(ingredient => !ingredient.category.includes(dropping));
			ingredients = ingredients.filter(ingredient => !ingredient.name.includes(dropping));
			ingredients = ingredients.filter(ingredient => !ingredient.tags.join(", ").includes(dropping));
		}
		
		let ingredientCategoriesToDrop = ["Restaurant Foods",
		"Pizza","Soups","Egg rolls, dumplings, sushi",
		"Eggs and omelets", "Fried rice and lo/chow mein",
		"Stir-fry and soy-based sauce mixtures", "Doughnuts, sweet rolls, pastries",
		"Bagels and English muffins", "Biscuits, muffins, quick breads", "Pancakes, waffles, French toast",
		"Cakes and pies", "Cereal bars", "Nutrition bars"
		];

		for (let dropping of ingredientCategoriesToDrop) {
			ingredients = ingredients.filter(ingredient => !(ingredient.category == dropping));
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


	constructor () {

		this.ingredients = new Set(); // what about weight???
		this.fitness = 0;
		this.fitnessBakingRole = 0;
		this.fitnessPrototypeCookie = 0;
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

	calcFitnessBakingRole(){

		let totalfitness = 0;
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

		this.fitnessBakingRole = totalfitness;
	}

	calcFitnessPrototypeCookie(){
		// FITNESS II – by similarity to prototype cookie.
		let totalfitness = 0;

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

		this.fitnessPrototypeCookie = totalfitness;
	}

	static getIngredientAmountsForPopulation(population) {

		// see how many of what ingredient of this recipe exists in the population. Then based on that number;
		let ingredientsInPop = {}

		for (let recipe of population) {

			for (let ingredInRecipe of recipe.ingredients) {

				let ingredName = [ingredInRecipe.name, ...ingredInRecipe.tags].join(', ');

                if (ingredName in ingredientsInPop) ingredientsInPop[ingredName]++;
                else ingredientsInPop[ingredName] = 0;

			}

		}
		
		return ingredientsInPop;
        
	}

	calcNovelty(ingredientsInPop, popSize) {

		let totalNovelty = 0;

		//console.log(ingredientsInPop);

		for (let ingred of this.ingredients) {

			let ingredName = [ingred.name, ...ingred.tags].join(', ');

			if (ingredName in ingredientsInPop) {
				totalNovelty += (1 - (ingredientsInPop[ingredName] / popSize)) 
			}
		}

		this.novelty = 1 + (totalNovelty / this.ingredients.size * 4)
	}

	calcFitness(ingredientsInPop, popSize){

		this.calcFitnessBakingRole();

		this.calcFitnessPrototypeCookie();

		this.calcNovelty(ingredientsInPop, popSize);

		this.fitness = this.fitnessBakingRole * this.fitnessPrototypeCookie * this.novelty;

	}
	
	/**
	 * [mutates the current recipe by either removing, adding 
	 * ,replacing one of the ingredients]
	 *
	 */
	mutate() {
		
		let randint = Math.floor(Math.random() * 6);
		let randIngred = Recipe.getRandomIngredient();
		let ingr = getRandomItemFromSet(this.ingredients);

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

		// remove 0g ingredients.
		for (let ingred of this.ingredients) {

			if (ingr.amount.amount < new Amount(0.5, "g").amount && this.ingredients.size > 1) {
				this.ingredients.delete(ingred)
			}

		}

		this.normalizeIngredients();

	}

	ingredientString(){
		let beginStr = "";
		let ingredientNames = Array.from(this.ingredients).reduce((ingredients, ingredient) => {
			
			ingredients.push(" - " + ingredient.amount.toString() + " " + (ingredient.tags.length > 0?ingredient.tags[0] + " ":"")+ ingredient.name)

			return ingredients;

		}, []);

		beginStr += ingredientNames.join("\n");

		return beginStr
	}

	nutrientString(){
        let beginStr = `Nutrients:\n`;

        let nutrStrings = []
        
        for (let nutr in this.nutrients) {
            nutrStrings.push(` - ${nutr} : ${this.nutrients[nutr].toString()}`)
        }
	
        return beginStr + nutrStrings.join("\n");
    }

    bakingRoleString(){
        let beginStr = 'Bakingroles:\n';

        let bakingIngreds = {}
        for (let brole in Recipe.bakingroles) {
            bakingIngreds[brole] = [];
        }

        for (let ingr of this.ingredients) {
            for (let brole of ingr.bakingrole) {
                bakingIngreds[brole].push((ingr.tags.length > 0?ingr.tags[0] + " ":"")+ ingr.name);
            }
        }

        for (let br in bakingIngreds) {
            
            beginStr += ` - ${br} : ${bakingIngreds[br].join(", ")}\n`
        }

        return beginStr;
    }


	toString() {

		let beginStr = `Cookie Recipe\nFitness: ${this.fitness} (roles: ${this.fitnessBakingRole}, prototype: ${this.fitnessPrototypeCookie}, novelty: ${this.novelty})\n\n${this.ingredients.size} ingredients total : \n`;
		
		beginStr += this.ingredientString() + "\n\n" + this.nutrientString()  + "\n\n" + this.bakingRoleString();

		return beginStr;
	}
	
}

module.exports = Recipe;