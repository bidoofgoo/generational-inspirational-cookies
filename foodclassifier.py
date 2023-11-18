from transformers import pipeline
import json


classifier = pipeline("zero-shot-classification")


candidate_labels = [
    "Base",
    "Fat",
    "Sweetener",
    "Binding Agent",
    "Leavening Agent",
    "Flavorings",
    "Add-ins",
    "Seasoning",
    "Texture Enhancers",
    "Decorations/Toppings",
    "Liquid",
    "Chemical Leaveners"
  ]

  ingredients = [
    "Flour",
    "Milk",
    "Baking soda",
    "Grandfathrers ashes"
]


file = open("data/results/ingredients.json")

ingredients = json.load(file)

ingrednames = set()

for ingred in ingredients:
    ingrednames.add(ingred['name'])
ingrednames


classified = classifier(
    list(ingrednames)[:1],
    candidate_labels=candidate_labels,
)


full_ingredients = {}

cutoffPoint = 0.125

for classi in classified:
    assignedClasses = []
    for i in range(len(classi["labels"])):
        label = classi["labels"][i]
        probability = classi["scores"][i]
        if(i == 0 or probability > cutoffPoint):
            assignedClasses.append(label)
    full_ingredients[classi["sequence"]] = {"cookiecat" : assignedClasses}

full_ingredients