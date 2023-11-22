# INSPIRATION 

A feature of Genetic Algorithm (GA) is that it allows for converging over time the proposed evolving candidate results into ones having certain desired properties (defined within the _fitting function_). This is an opposite approach to using GA as a way to "inject" novelties into initially standarized population and expecting unconventional results.

Our thinking goes to the former. Instead of generating more and more varied cookie recipes, we set ourselves a goal to converge a wide and (too) general food database into producing ingredient recipes that resemble those of real cookies'.

Our initial idea was to create a cookie resembling _mochi_ cookies as close as possible in some way. We discarded it however, because we were not able to find an (open) database with cookie-specific ingredients only.

Thus, we generalized further.

As our _prototype cookie_ (the recipe that is the goal of GA's convergence), we chose a recipe for the *red velvet cookie*. We wanted to see, how much our algorithm ends up presenting results close to this _prototype cookie_ given a vast database of various food (and not telling it to pick cookie-specific ingredients in advance). We define this _close resembles_ in the "fitting function" section.


# DATABASE / Inspiring set

After quering Internet for some time, we decided on two databases at FoodData Central hosted by US Department of Agriculture, we used two databases:
- [Foundation Foods as `food.json`][https://fdc.nal.usda.gov/download-datasets.html],
- [FNDDS as `food2.json`][https://fdc.nal.usda.gov/download-datasets.html].

Those databases contain a variety of information about nutrition value of a food item.

Initially, we were looking for a database which includes any information about _taste_. However, little could we find, the closest result being a database about Indian cuisine. Thus, we discarded the idea to use _taste_ as a key.

Two other databases we considered were databases of:
- [world cuisines:][https://www.kaggle.com/datasets/kaggle/recipe-ingredients-dataset],
- [cocktails:][https://github.com/stevana/cocktails],
but we discarded them as the first two databases seemed sufficient (and were of a similar format).

The other database we used is the list of nutrients for red velvet cookie (_prototype cookie_) called `red_velvet_nutrients.json` per 1 cookie (ca. 44g). Those were results from Google suggestions after asking for "red velvet nutrients". The fittest cookies coming from our GA should have similar nutrients.


# KNOWLEDGEBASE

We constructed our knowledgebase in two steps:
1. `knowledgebase.js`: combine and extract relevant data from Foundation Foods and FNDDS,
2. `foodclassifier.ipynb`: label ingredient data with its role in a baking process of the cookie using zero-short classification Bart model.

## `knowledgebase.js`

This script outputs the following files to the `data/results` directory:
- `ingredients.json`: combined (and heavily reduced) version of the original databases containing:
	- name
	- tags (additional information extracted from the original record name)
	- nutrients (name, amount, unit)
	- category.
- `categories.tx`: a list of all food categories that items are classified by in the original databases,
- `nutrients.tx`: a list of all nutrients appearing in the original databases,
- `units.txt`: a list of all different units used to measure amount of nutrients in the original databases.

As a result, `ingredients.json` – our main knowledgebase – consists of almost six thousands records of various general food items (and not only cookies-specific).

## `foodclassifier.ipynb`

This Python script utilizes a [valhalla/distilbart-mnli-12-3][https://huggingface.co/valhalla/distilbart-mnli-12-3] zero-shot Bart model to classify each `ingredient` from `ingredient.json` by a role of which this ingredient could serve within a cookie recipe. We got those roles by asking ChatGPT what are the roles that ingredients can serve in a cookie.

Multiple roles could have been assigned to one ingredient.

The results were evaluated by us eyeballing them. To our surprise, they were quite accurate. The only was that a `Leavening agent` was not assignent. We fixed it by renaming it to `Leavener/Rising agent`, which solved the issue quite effectively.

Backing roles:
- "Base",
- "Fat",
- "Sweetener",
- "Binding Agent",
- "Leavener/Rising agent",
- "Flavorings",
- "Add-ins",
- "Seasoning",
- "Texture Enhancers",
- "Decorations/Toppings",
- "Liquid"

The results of this classification are stored in `ingredients_rolesX.json` files (where X represents a number of each iteration of the classification). This file is the same as `ingredients.json`, but each `ingredient` gets an additional key `bakingroles` with the predicted baking roles if used in a cookie recipe.

For the main database for our GA we will be using `ingredients_roles3.json` file.


# GENETIC ALGORITHM

## Overview

The main body of `algorithm.js` is our GA implementation. We made it very much based on the "Simple Pierre" implementation:
1. initialize the population with `Recipes` containing random ingredients,
2. evaluate the *fitness* of each `Recipe`,
3. create new generation of `Recipes` applying *crossover* and *mutations* to the *fittest* `Recipes`.
4. evolve for $n$ generations.

The last lines of that file contain the summary of the GA:
```js
population
.initialize()
.evolve()
.report();
.export();
```

The `Recipe` class is where the knowledgebase and GA meet. We import the `ingredient_roles3.json` to the class' static and filter it from items which we fought of as reduntant or harming for the aglorithm:
- all the nutrients not used in the `red_velvet_nutrients.json`,
- too awkward ingredients (sandwiches, restaurant dishes, energy drink etc...),
- too awkward categories (pizza, nutrition bars etc...).

`Recipe` is responsible for handling most of the interaction with our knowledgebase (e.g. picking initial ingredients) as well as for generating data important for genetic algorithm (fitness, novelty, mutation). Other important task for `Recipe` is to not only to store ingredients but also to provide normalization of their amount (we normalize to 100g).

`Amount` is a helper class for handling ingredients and nutrients units conversion.

## Next generation

The code below (adapted from "Simple Pierre") and outlines the creation of a new generation of recipes:
```js
let R = []; // generated recipes

while (R.length < size) {

	// select two recipes based on fitness:
	let r1 = this.selectRecipe(population);
	let r2 = this.selectRecipe(population);

	// crossover
	let r = this.crossover(r1, r2);	// crossover

	// mutation
	let mutateAmount = Math.floor(Math.random() * 10)
	for (let i=0; i<mutateAmount; i++) r.mutate();

	R.push(r);

}

this.evaluateRecipes(R);

return R;
```

This snippet:
1. selects two of some of the most fit Recipes,
2. creates their child by *crossover*,
3. applies random amount of *mutation*,
4. evaluates fitnesses.

## Ingredients Normalization

After creation of each new individual, we normalize the amount of each ingredient to produce a 100g portion of a cookie. In a similar manner, we normalize _prototype cookie_'s nutrients amount.

## Fitness

We thought of the the fitness to be comprised of the following three components:
1. _baking role typicality_: regarding amount of ingredients per baking role, approach the same proportions as in an average cookie (according to ChatGPT) (see `Recipe`'s `static bakingroles`).
2. _prototype cookie nutrients resemblance_: the recipe's nutrients should resemble as much as possible nutrients of the _prototype cookie_ (red velvet).
3. novelty: we include novelty within the fitness calculation. This results in getting varied recipes within the same generation (otherwise recipes tended to converge to the same ingredients).

## Crossover

The crossover between two fit individuals results in an individual getting a random half of ingredient types from both. If the same ingredient happens to be selected twice, their amount is added instead.

## Mutation

There are several patterns of mutation:
- delete random ingredient,
- add random ingredient,
- swap ingredient to a random one,
- increase amount of an ingredient,
- decrease amount of an ingredient.

## Termination criterion

We generated our cookies with the following parameters:

|Param|Value|
|---|---|
|size|500|
|generations|1000|
|maxMutations|50|


# Evaluation of Creativity

In order to evaluate our system, we used a peculiarity of our original unfiltered knowledgebase. As the dataset had already contained cookie-like food, we checked if the 'cookie' (or a similar product) appears itself as a prominent ingredient. This turned out to be true: in majority of the recipes generated before removal of cookie-like food from our knowledgebase, cookie-like food not only appeared, but they took a large quantities of the available ingredient space.

This means, that given a food-generic database, the fittests recipes indeed converge into a cookie based on the definition of fitness we have provided.


# AI Cookbook.






