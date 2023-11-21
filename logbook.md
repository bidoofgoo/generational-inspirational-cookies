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

`algorithm.js` is the main file with our GA implementation.

The `knowledgebase.js` provides a way of combining and extracting relevant data for the Foundation Foods and FNDDS.







Termination criterion 

- 

Process of presentation 

Evaluation of Creativity 
## Red velvet cake – cookie prototype

## Knowledgebase for the inspiring set 

initialising the inspiring set 

evaluation of the recipies - fitness fun

generating recipes 

crossover of recipies

mutation of recipies 

to- do 

- assigning amount to the baking role
- fitness function comparing with velvet recipe
- novelty fix it



