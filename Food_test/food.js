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

const dir = '../data'

const databases = {
	foods: JSON.parse(fs.readFileSync(dir + '/food.json')).FoundationFoods,
	foods2: JSON.parse(fs.readFileSync(dir + '/food2.json')).SurveyFoods,
	cuisines: JSON.parse(fs.readFileSync(dir + '/cuisines.json')),
	cocktails: YAML.parse(fs.readFileSync(dir + '/cocktails/cocktails.yaml', 'utf8'))
}

/**
 * Process food database.
 */
if (LOG) {
	console.log('* * * * * * * * * * * *');
	console.log('*       F O O D       *');
	console.log('* * * * * * * * * * * *');
}


databases.foods.categories = new Set();
databases.foods.ingredients = {};

for (food of databases.foods) {

	let descriptions = food.description.replace(/[\(\)]/g, '').split(', ');
	let name = descriptions[0].toLowerCase();
	
	let tags = [];
	for (i=1; i<descriptions.length; i++) tags.push(descriptions[i]);

	databases.foods.ingredients[name] = {
		'tags': tags,
		'class': food.foodClass,
		//'nutrients': food.foodNutrients,
		'category': food.foodCategory.description
	};

	databases.foods.categories.add(food.foodCategory.description);

}

if (LOG) {
	console.log('** CATEGORIES **');
	console.log(databases.foods.categories);
	console.log('** INGREDIENTS **');
	console.log(databases.foods.ingredients);
}


/**
 * Process food2 database.
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

databases.foods2.categories = new Set()
databases.foods2.ingredients = {};

for (food of databases.foods2) {

	let descriptions = food.description.replace(/[\(\)]/g, '').split(', ');
	let name = descriptions[0].toLowerCase();
	
	let tags = [];
	for (i=1; i<descriptions.length; i++) tags.push(descriptions[i]);

	databases.foods2.ingredients[name] = {
		'tags': tags,
		'class': food.foodClass,
		//'nutrients': food.foodNutrients,
		'category': food.wweiaFoodCategory.wweiaFoodCategoryDescription,
		'inputFoods': food.inputFoods
	};

	databases.foods2.categories.add(food.wweiaFoodCategory.wweiaFoodCategoryDescription);

}

if (LOG) {
	console.log('** CATEGORIES **');
	console.log(databases.foods2.categories);
	console.log('** INGREDIENTS **');
	console.log(databases.foods2.ingredients);
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