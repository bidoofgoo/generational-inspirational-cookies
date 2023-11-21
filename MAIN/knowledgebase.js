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

const assert = require('assert');
const fs = require('fs');
const YAML = require('yaml');

/**
 * If True, print databases and other info to the console.
 */
const LOG = false;

const input_dir = '../data'
const output_dir = '../data/results';

const databases = {

	// JSON/YAML files
	foods: JSON.parse(fs.readFileSync(input_dir + '/food.json')).FoundationFoods,
	foods2: JSON.parse(fs.readFileSync(input_dir + '/food2.json')).SurveyFoods,
	//cuisines: JSON.parse(fs.readFileSync(input_dir + '/cuisines.json')),
	//cocktails: YAML.parse(fs.readFileSync(input_dir + '/cocktails/cocktails.yaml', 'utf8')),

	// same as above but parsed
	ingredients: [],
	categories: new Set(),
	nutrients: new Set(),
	units: new Set(),

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

		assert(typeof name === 'string', "Nutrient's name must be a string.");
		assert(typeof amount === 'number', "Nutrient's amount must be a number.");
		assert(typeof unit === 'string', "Nutrient's unit must be a string.");

		this.name = name;
		this.amount = amount;
		this.unit = unit ?? 'undefined';

	}

}


/**
 * Convenience class for reporting cookie's ingredients.
 */
class Ingredient {

	constructor(name, category) {

		assert(typeof name === 'string', "Ingredient's name must be a string.");
		assert(typeof category === 'string', "Ingredient's category must be a string.");

		this.name = name;
		this.tags = [];
		this.nutrients = [];
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
	
	let ingredient = new Ingredient(name, food.foodCategory.description);

	for (i=1; i<descriptions.length; i++) {

		ingredient.tags.push(descriptions[i]);

	}

	for (nutrient of food.foodNutrients) if (nutrient.amount) {

		databases.nutrients.add(nutrient.nutrient.name);
		databases.units.add(nutrient.nutrient.unitName);

		ingredient.nutrients.push(new Nutrient(
			nutrient.nutrient.name,
			nutrient.amount,
			nutrient.nutrient.unitName));

	}

	databases.ingredients.push(ingredient);

	databases.categories.add(food.foodCategory.description);

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

console.log(databases.foods[1].foodNutrients[1]);

for (food of databases.foods2) {

	let descriptions = food.description.replace(/[\(\)]/g, '').split(', ');
	let name = descriptions[0].toLowerCase();
	
	let ingredient = new Ingredient(name, food.wweiaFoodCategory.wweiaFoodCategoryDescription);

	for (i=1; i<descriptions.length; i++) {

		ingredient.tags.push(descriptions[i]);

	}

	for (nutrient of food.foodNutrients) if (nutrient.amount) {

		databases.nutrients.add(nutrient.nutrient.name);
		databases.units.add(nutrient.nutrient.unitName);

		ingredient.nutrients.push(new Nutrient(
			nutrient.nutrient.name,
			nutrient.amount,
			nutrient.nutrient.unitName));

	}

	databases.ingredients.push(ingredient)

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
 * Write the transform database results to the file.
 */

fs.writeFileSync(output_dir + '/ingredients.json', JSON.stringify(databases.ingredients));
fs.writeFileSync(output_dir + '/categories.txt', [...databases.categories].join('\n'));
fs.writeFileSync(output_dir + '/nutrients.txt', [...databases.nutrients].join('\n'));
fs.writeFileSync(output_dir + '/units.txt', [...databases.units].join('\n'), {encoding:'utf8'});