/**
 * By AJD
 *
 * This file preprocesses the databases we assembled:
 * FoodDataCentral as 'foods'
 * FoodDataCentral_Survey as 'foods2'
 * ??? as 'cuisines'
 *
 * TO DO: finish description!!!
 */

const fs = require('fs');
const YAML = require('yaml')

/**
 * If True, print databases and other info to the console.
 */
const LOG = false;

const input_dir = '../data'
const output_directory = '../data/results';

const databases = {

	// JSON/YAML files
	foods: JSON.parse(fs.readFileSync(input_dir + '/food.json')).FoundationFoods,
	foods2: JSON.parse(fs.readFileSync(input_dir + '/food2.json')).SurveyFoods,
	cuisines: JSON.parse(fs.readFileSync(input_dir + '/cuisines.json')),
	cocktails: YAML.parse(fs.readFileSync(input_dir + '/cocktails/cocktails.yaml', 'utf8')),

	// above but parsed
	ingredients: [],
	categories: new Set(),
	nutrients: new Set()

}

/**
 * Process food database.
 */
if (LOG) {
	console.log('* * * * * * * * * * * *');
	console.log('*       F O O D       *');
	console.log('* * * * * * * * * * * *');
}

/**
 * Convenience class for reporting nutrients.
 */
class Nutrient {

	constructor(name, amount, unit) {

		if (!(typeof name == 'string')) throw Error("Nutrient's name must be a string.");
		if (!(typeof amount == 'number')) throw Error("Nutrient's amount must be a number.");
		if (!(typeof unit == 'string')) throw Error("Nutrient's unit must be a string.");		

		this.name = name;
		this.amount = amount;
		this.unit = unit;

	}

}


/**
 * Convenience class for reporting cookie's ingredients.
 */
class Ingredient {

	constructor(name, tags, nutrients, category) {

		if (!(typeof name == 'string')) throw Error("Ingredient's name must be a string.");
		if (!Array.isArray(tags)) throw Error("Ingredient's tags must be an array.");
		if (!Array.isArray(nutrients)) throw Error("Ingredient's nutrients must be an array of _Nutrient.");
		if (!(typeof category == 'string')) throw Error("Ingredient's category must be a string.");

		this.name = name;
		this.tags = tags;
		this.nutrients = nutrients; // array of Nutrients.
		this.category = category;

	}

}


/**
 * Process foods database.
 * This database is similar to the previous one
 * but is richer and more detailed.
 *
 * TO DO: check 'inputFoods' keys.
 */

for (food of databases.foods) {

	let descriptions = food.description.replace(/[\(\)]/g, '').split(', ');
	let name = descriptions[0].toLowerCase();
	
	let tags = [];
	for (i=1; i<descriptions.length; i++) tags.push(descriptions[i]);

	let nutrients = [];
	for (nutrient of food.foodNutrients) if (nutrient.amount && nutrient.unit) {

		databases.nutrients.add(nutrient.nutrient.name);

		nutrients.push(new Nutrient(
			nutrient.nutrient.name,
			nutrient.amount,
			nutrient.unit));

	}

	databases.ingredients.push(new Ingredient(name, tags, nutrients, food.foodCategory.description));

	databases.categories.add(food.foodCategory.description);

	break;

}

if (LOG) {
	console.log('** CATEGORIES **');
	console.log(databases.foods.categories);
	console.log('** INGREDIENTS **');
	console.log(databases.foods.ingredients);
	console.log('** NUTRIENTS **');
	console.log(databases.foods.nutrients);
}


/**
 * Process foods2 database.
 * This database is similar to the previous one
 * but is richer and more detailed.
 *
 * TO DO: check 'inputFoods' keys.
 */

if (LOG) {
	console.log('* * * * * * * * * * * *');
	console.log('*     F O O D 2       *');
	console.log('* * * * * * * * * * * *');
}

for (food of databases.foods2) {

	let descriptions = food.description.replace(/[\(\)]/g, '').split(', ');
	let name = descriptions[0].toLowerCase();
	
	let tags = [];
	for (i=1; i<descriptions.length; i++) tags.push(descriptions[i]);

	let nutrients = [];
	for (nutrient of food.foodNutrients) if (nutrient.amount && nutrient.unit) {

		databases.nutrients.add(nutrient.nutrient.name);

		nutrients.push(new Nutrient(
			nutrient.nutrient.name,
			nutrient.amount,
			nutrient.unit));

	}

	databases.ingredients.push(new Ingredient(name, tags, nutrients, food.wweiaFoodCategory.wweiaFoodCategoryDescription))

	databases.categories.add(food.wweiaFoodCategory.wweiaFoodCategoryDescription);

}

if (LOG) {
	console.log('** CATEGORIES **');
	console.log(databases.foods2.categories);
	console.log('** INGREDIENTS **');
	console.log(databases.foods2.ingredients);
	console.log('** NUTRIENTS **');
	console.log(databases.foods2.nutrients);
}


/**
 * Process cuisine database
 * This is a different database.
 *
 * TO DO: some ingredients are like 'breakfast meat as ingredient in omelet':
 *        should process it to: 'breakfast meat' (split on _as_)
 *        and create 'omelet' as a dish?
 * TO DO: check 'inputFoods' keys.
 */

if (LOG) {
	console.log('* * * * * * * * * * * *');
	console.log('*    C U I S I N E    *');
	console.log('* * * * * * * * * * * *');
}

const ingredients = new Set();

for (cuisine of databases.cuisines) {

	for (ingredient of cuisine.ingredients) ingredients.add(ingredient);

}

if (LOG) {
	console.log('**** CUISINE ****');
	console.log(databases.cuisines);
	console.log('** INGREDIENTS **');
	console.log(ingredients);
}


/**
 * Processing cocktails database
 * Database of cokctails with:
 * - timing,
 * - taste,
 * - ingredients (array),
 * - preparation
 */

if (LOG) {
	console.log('*** COCKTAILS ***');
	console.log(databases.cocktails);
}

/**
 * Write the transform database results to the file.
 */

fs.writeFileSync(output_directory + '/ingredients.json', JSON.stringify(databases.ingredients));
fs.writeFileSync(output_directory + '/categories.json', [...databases.categories].join(', '));
fs.writeFileSync(output_directory + '/nutrients.json', [...databases.nutrients].join(', '));