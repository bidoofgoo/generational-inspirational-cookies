const assert = require('assert');
const { log } = require('console');
const fs = require('fs');

const Amount = require('./Amount.js');
const Recipe = require('./Recipe.js');
// //let test = new Recipe2();
// import Recipe from './Recipe.js'

const data_path = 'data'
const dataResults_path = data_path + '/results';

/**
 * MAIN OBJECT OF THE ALGORITHM.
 * @type {Object}
 */
const population = {

	/**
	 * Individuals of the population.
	 */
	recipes: [],

	/**
	 * Size of the population/generation.
	 */
	size: 250,

	generations: 1000,

	maxMutations: 500, 

	/**
	 * Initialize population.
	 * 
	 * Fills the .recipes array with Recipes.
	 *
	 * @return  {population}  [return description]
	 */
	initialize: function () {

		for (let i=0; i<this.size; i++) {

			let recipe = new Recipe();
			recipe.randomizeInitialIngredients();
			this.recipes.push(recipe);

		}

		return this;
		
	},

	/**
	 * Create new generation of Recipes.
	 * 
	 * @param   {int}      size        size of the population
	 * @param   {[Recipe]} population  array of Recipes.
	 * 
	 * @return  {[Recipe]} crossovered and mutated population.
	 */
	generateRecipes: function(size, population) {

		let R = []; // generated recipes
	
		while (R.length < size) {
	
			// select two recipes based on fitness:
			let r1 = this.selectRecipe(population);
			let r2 = this.selectRecipe(population);
	
			// crossover
			let r = this.crossover(r1, r2);	// crossover

			// mutation
			let mutateAmount = Math.floor(Math.random() * 20)
			for (let i=0; i<mutateAmount; i++) r.mutate();
	
			R.push(r);
	
		}
	
		this.evaluateRecipes(R);
	
		return R;
	
	},

	evaluateRecipes: function(recipes){

		let ingredientsInPop = Recipe.getIngredientAmountsForPopulation(recipes)

		for (let recipe of recipes) recipe.calcFitness(ingredientsInPop, recipes.length);

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

	/**
	 * [Crossover two recipes into a new child recipe]
	 *
	 * @param   {[Recipe]}  r1  [parent 1]
	 * @param   {[Recipe]}  r2  [parent 2]
	 *
	 * @return  {[Recipe]}      [child]
	 */
	crossover : function(r1, r2){

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

	evolve: function (generations) {

		for (let index = 0; index < generations; index++) {
			
			let R = this.generateRecipes(this.size, this.recipes);
			this.recipes = this.selectPopulation(this.recipes, R);

			console.log(`GENERATION ${index}: Max fitness: ${this.recipes[0].fitness} (novelty ${this.recipes[0].novelty}) `);

			//console.log(this.recipes[0]);
			
		}

		return this;
	
	},

	report: function(toReport) {

		assert(this.recipes.length === this.size, `Got ${this.recipes.length} recipes, expected ${this.size}...`);

		console.log("\nReport!:\n");

		for (let i=0; i<toReport; i++) {

			let recipe = this.recipes[i]
			console.log(recipe.toString() + "\n");
			
		}

		return this;
	},

	export: function(toExport){

		console.log("\nExport!:\n");

		let currentdate = new Date(); 
		let datetime = currentdate.getDate() + "-"
                + (currentdate.getMonth()+1)  + "-" 
                + currentdate.getFullYear() + "-"  
                + currentdate.getHours() + "-"  
                + currentdate.getMinutes() + "-" 
                + currentdate.getSeconds();

		for (let i=0; i<toExport; i++) {

			let beginStr = `Generated cookie no ${i+1} - After ${population.generations} generations with a population size of ${population.size} and a mutation rate of ${population.maxMutations}.\n\n`

			let recipe = this.recipes[i]
			fs.writeFileSync("cookie_exports\\" + datetime + "-Cookie" + (i + 1) + ".txt", beginStr + recipe.toString())
			
		}

		return this;
	}

}

population
.initialize()
.evolve(population.generations)
.report(3)
.export(5);
// console.log('\nEvolution TURNED OFF.\n')