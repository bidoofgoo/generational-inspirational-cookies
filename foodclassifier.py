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
    
classes = classifier(
    ingredients,
    candidate_labels=candidate_labels,
)

print(classes)