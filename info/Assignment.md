# The Great Bitwise Bake Off

In this assignment you are required to build a recipe generator for cookies and/or cakes using an approach similar to the one explored in Tutorial 5: Simple PIERRE.

## Tasks:

1. Gather an Inspiring set for Cookie/Cake recipes.
	- combining elements of different recipes
2. Create a Knowledgebase for the Inspiring Set
3. Implement a Recipte Generator using a Genetic Algorithm 
4. Present generated recipes in a small cookboock.

## Deliver:

1. **logbook**:
	- step-by-step account of how you tackled the tasks outlined above and your thoughts on the process.
	- which part of the cookbook were generated by Generative AI?
	- final entry: how to evaluate the creativity of your system?
2. **sourcecode**:
	- Zip
	- README: system requirements for compiling and running
3. **coockboock**:
	- PDF / webpage
	- 3 _examples_ of generated recipes

## Database:

Ie. PIERRRE's dataset is 5000 items.

[Easy Sugar Cookies][https://www.allrecipes.com/recipe/9870/easy-sugar-cookies/]

[Oatmeal Cookies][https://www.allrecipes.com/recipe/19247/soft-oatmeal-cookies/]

[Chocolate Cookie Dough][https://sallysbakingaddiction.com/inside-out-chocolate-chip-cookies/]

[Crazy Cookie Dough][https://www.biggerbolderbaking.com/crazy-cookie-dough/]

[Shortbread][https://www.allrecipes.com/recipe/10269/shortbread-cookies-ii/]

[List of cookies][https://en.wikipedia.org/wiki/List_of_cookies]

### Note – you are not limited!
You are also NOT limited to having an inspiring set of recipes, remember that according to Ritchie the inspiring set can be implicitly defined by the knowledge that the developer has about examples from the creative domain. In this context, this could mean that you choose to gather together a list of suitable ingredients with meta-level information (perhaps coded into the genetic algorithm) about how ingredients might be combined.

## Knowledgebase for the Inspiring Set

Create a **file** (e.g. JSON) with converted recipes to a format you will use.

**Examples of data:**
- _cookie classes_ (cake, biscuit, muffin...)
- _daytime_ (breakfast, snack...)
- _classes of ingredients_ (sweet, savoury, liquid, herb, spice, etc)
- _role of ingredients_ (binding agent, rising agent, seasoning, decoration etc)

### Note – make it simple!
It only makes sense to spend the time adding this information if you think you can use these classifications to generate and/or evaluate recipes more intelligently.

## Implement a Recipe Generator using Genetic Algorithm

If using Python: [geneticalgorithm][https://pypi.org/project/geneticalgorithm/]

Predefine:
- **Stopping criteria:** ?
- **Final output:** ?

Eg.: should your system run for a fixed number of generations and return the best recipe found so far, or should its run be controlled interactively by a user?

## Present Generated Recipes in a Small Cookbook

- How you want to present your recipes?
- Use Generative AI (images, backstory, embelishments etc)
- cookboock generation itself is not part of the assignment!

Persuade potential "cook" to bake your cookie! Examples:
- recipe: how to cook?
- devise a template with placeholders for the names of ingredients used in the recipe
- what other features of a cookbook recipe help to persuade?
---