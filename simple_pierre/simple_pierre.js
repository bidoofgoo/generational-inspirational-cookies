/**
 * This code is ArturJD's adaptation
 * of the Simple PIERRE by Rob Saunders
 * (based itself on [Morris et al., 2012]
 * PIERRE soup recipies creator).
 *
 * It uses a genetic algorithm to create
 * the best soup ever given the dataset
 * 'recipes.json'.
 *
 * AJD made it to work with NodeJS
 * (original is for P5.js).
 */

const fs = require('fs');

const json = fs.readFileSync(`recipes.json`, 'utf8');
const recipes = JSON.parse(json).recipes;

const allIngredients = [];

const populationSize = 20;

let population = [];
let recipe_number = 0;
let history = [];


/**
 * @param  {number} any number
 * @return {number} integer (the floor of number)
 */
function int(number) {
	return Math.floor(number)
}

/**
 * Mine [AJD] implementation of P5js random().
 * @param  {number|array} array OR max number (if one provided) OR min number (if two numbers provided)
 * @param  {number} max number (if two numbers provided)
 * @return {number|array elem} random array element OR random number (if one provided) OR random integer (if two provided)
 */
function random(a, b) {

	if (Array.isArray(a)) {

		let random_index = Math.floor(a.length * Math.random());
		return a[random_index];

	} else if (typeof a == 'number') {

		if (b === undefined) {
			return a * Math.random();
		}

		// get random integer
		return Math.floor(Math.random() * (max - min) ) + min;

	} else throw Error('Wrong type of argument.')

}


/**
 * Evaluate fitness of each recipe
 * (by adding .fitness property)
 * @param recipes {[Recipe]}
 */
function evaluateRecipes(recipes) {

	for (const r of recipes) {
		r.fitness = r.ingredients.length;
	}

}


/**
 * Return only one recipe if it is 'fit' enough.
 * @param recipes {array}
 * @return {Recipe} random fit recipe.
 */
function selectRecipe(recipes) {

	// calculate the fitness
	let sum = recipes.reduce((a, r) => a + r.fitness, 0);
	let f = int(random(sum));

	// cheap randomisation using hash table unpredictability.
	for (const r of recipes) {
		if (f < r.fitness) return r;
		f -= r.fitness;
	}

	// emergency: return last if no one is fit enough.
	return recipes[recipes.length - 1];

}


/**
 * Crossover two recipes.
 * @param r1 {Recipe}
 * @param r2 {Recipe}
 * @return {Recipe}
 */
function crossoverRecipes(r1, r2) {

	if (!('ingredients' in r1)) {
		throw Error('First ingredient must have a "ingredients" property.')
	}

	if (!('ingredients' in r2)) {
		throw Error('Second ingredient must have a "ingredients" property.')
	}

	let p1 = int(random(r1.ingredients.length));
	let p2 = int(random(r2.ingredients.length));

	let r1a = r1.ingredients.slice(0, p1);
	let r2b = r2.ingredients.slice(p2);

	let r = {};
	r.name = "recipe " + recipe_number++;
	r.ingredients = r1a.concat(r2b);

	return r;

}


/**
 * Mutate recipe in place.
 * The type of the mutation is chosen randomly at the function call:
 * 0: mutate the amount of an ingredient,
 * 1: mutate the type of ingredient,
 * 2: add a new ingredient to a recipe,
 * 3: delete a random ingredient
 * @param  {Recipe} a recipe to mutate
 */
function mutateRecipe(r) {

	mutation_id = int(random(4));

	switch (mutation_id) {

		// mutate the amount of an ingredient
		case 0:
			let i = int(random(r.ingredients.length));
			r.ingredients[i] = Object.assign({}, r.ingredients[i]);
			r.ingredients[i].amount += int(r.ingredients[i].amount * 0.1);
			r.ingredients[i].amount = Math.max(1, r.ingredients[i].amount);
			break;

		// mutate the type of ingredient
		case 1:
			let j = random(r.ingredients.length);
			r.ingredients[j] = Object.assign({}, r.ingredients[j]);
			r.ingredients[j].ingredient = random(allIngredients).ingredient;
			break;

		// add a new ingredient to a recipe
		case 2:
			r.ingredients.push(random(allIngredients));
			break;

		// delete a random ingredient
		case 3:
			if (r.ingredients.length > 1) {
			r.ingredients.splice(random(r.ingredients.length), 1);
			}
			break;
	}

}


/**
 * Normalise recipe in place.
 * @param  {Recipe}
 */
function normaliseRecipe(r) {

	/*
		Consolidate the ingredient list,
		so that any duplicate ingredients are combined together.

		It works by constructing a Map of unique ingredients,
		indexed by the name of the ingredient.

		As the ingredients are iterated through,
		if it is not in the unique ingredients map then it is added,
		otherwise the amount of the ingredient is increased.

		The unique ingredients map is then converted into an array
		to replace the current ingredients list.
	*/

	let uniqueIngredientMap = new Map();

	for (const i of r.ingredients) {

		if (uniqueIngredientMap.has(i.ingredient)) {

			let n = uniqueIngredientMap.get(i.ingredient);
			n.amount += i.amount;

		} else {

			uniqueIngredientMap.set(i.ingredient, Object.assign({}, i));

		}
	}

	/*
		Calculate the sum of all of the ingredient amounts
		and use this to determine a scaling factor.

		Each of the ingredient amounts are then rescaled
		according to this scaling factor,
		with a check that the amount is at least 1g (or 1ml).
	*/

	r.ingredients = Array.from(uniqueIngredientMap.values());

	let sum = r.ingredients.reduce((a, i) => a + i.amount, 0);
	let scale = 1000 / sum;

	for (let i of r.ingredients) {
		i.amount = Math.max(1, int(i.amount * scale));
	}

}


/**
 * Combine old and new populations by choosing those individuals
 * with the highes fitness.
 * @param P {[Recipe]]} original population (already sorted!).
 * @param R {[Recipe]} newly generated recipes R.
 * @return {[Recipe]} new population (sorted).
 */
function selectPopulation(P /* Already sorted!!! */, R) {

	// sort new generation R.
	R.sort((a, b) => b.fitness - a.fitness);

	// concatenate fittest individuals from P and R.
	P = P.slice(0, P.length/2).concat(R.slice(0, R.length/2));

	// sort the 'new' population
	P.sort((a, b) => b.fitness - a.fitness);

	return P;

}


/**
 * @param size {int}
 * @param population {[Recipe]} ???
 * @return R {[Recipe]} new generation of the population.
 */
function generateRecipes(size, population) {

	let R = []; // generated recipes

	while (R.length < size) {

		// select two recipes:
		let r1 = selectRecipe(population);
		let r2 = selectRecipe(population);

		// apply modifications
		let r = crossoverRecipes(r1, r2);
		mutateRecipe(r);
		
		// normalise
		normaliseRecipe(r);

		R.push(r);

	}

	evaluateRecipes(R);

	return R;

}


/**
 * Main function: run the whole thing.
 */
function evolve() {

	let R = generateRecipes(populationSize, population);
	population = selectPopulation(population, R);

	history.push(population[0].fitness);

	console.log("max. fitness = " + history[history.length - 1]);

	let recipe_text = population[0].name + "\n";
	for (let i of population[0].ingredients) {
		recipe_text += "\n" + i.amount + i.unit + " " + i.ingredient;
	}

	console.log(recipe_text);

}

/* * * * * * * * * * * * * * */
/*          C O D E          */
/* * * * * * * * * * * * * * */

/* SETUP: extract all ingredients */
for (const r of recipes) {
	for (const i of r.ingredients) allIngredients.push(i);
}

/*	Initialize population */
for (let i=0; i < populationSize; i++) {
	population.push(random(recipes));
}

evaluateRecipes(population);
population.sort((a, b) => b.fitness - a.fitness);

const ITERATIONS = 10;

for (i=0; i<ITERATIONS; i++) evolve();