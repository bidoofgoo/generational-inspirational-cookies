from transformers import pipeline

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

classifier = pipeline("zero-shot-classification")
    
classified = classifier(
    ingredients,
    candidate_labels=candidate_labels,
)

full_ingredients = {

}

cutoffPoint = 0.125

for classi in classified:
    assignedClasses = []
    for i in range(len(classi["labels"])):
        label = classi["labels"][i]
        probability = 
    full_ingredients[classi["sequence"]] = {"categories" : assignedClasses}