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

/**
 * Process food database.
 */

const foods = JSON.parse(fs.readFileSync('../data/food.json')).FoundationFoods;

foods.categories = new Set();
foods.ingredients = {};

for (food of foods) {

	let descriptions = food.description.replace(/[\(\)]/g, '').split(', ');
	let name = descriptions[0].toLowerCase();
	
	let tags = [];
	for (i=1; i<descriptions.length; i++) tags.push(descriptions[i]);

	foods.ingredients[name] = {
		'tags': tags,
		'class': food.foodClass,
		//'nutrients': food.foodNutrients,
		'category': food.foodCategory.description
	};

	foods.categories.add(food.foodCategory.description);

}

console.log(foods.categories);
console.log(foods.ingredients);


/**
 * Process food2 database.
 * This database is similar to the previous one
 * but is richer and more detailed.
 *
 * TO DO: check 'inputFoods' keys.
 */

const foods2 = JSON.parse(fs.readFileSync('../data/food2.json')).SurveyFoods;

foods2.categories = new Set()
foods2.ingredients = {};

for (food of foods2) {

	let descriptions = food.description.replace(/[\(\)]/g, '').split(', ');
	let name = descriptions[0].toLowerCase();
	
	let tags = [];
	for (i=1; i<descriptions.length; i++) tags.push(descriptions[i]);

	foods2.ingredients[name] = {
		'tags': tags,
		'class': food.foodClass,
		//'nutrients': food.foodNutrients,
		'category': food.wweiaFoodCategory.wweiaFoodCategoryDescription,
		'inputFoods': food.inputFoods
	};

	foods2.categories.add(food.wweiaFoodCategory.wweiaFoodCategoryDescription);

}

console.log(foods2.categories);
console.log(foods2.ingredients);


/**
 * Process cuisine database
 * This is a different database.
 *
 * TO DO: some ingredients are like 'breakfast meat as ingredient in omelet':
 *        should process it to: 'breakfast meat' (split on _as_)
 *        and create 'omelet' as a dish?
 * TO DO: check 'inputFoods' keys.
 */

const cuisines = JSON.parse(fs.readFileSync('../data/cuisines.json'));

const ingredients = new Set();

for (cuisine of cuisines) {

	for (ingredient of cuisine.ingredients) ingredients.add(ingredient);

}

console.log(cuisines)
console.log(ingredients);