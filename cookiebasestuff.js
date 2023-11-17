// Define the 12 essential cookie ingredient categories
const cookieCategories = [
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
  ];
  
  // Define ingredients corresponding to each category
  const ingredientsByCategory = [
    ["all-purpose flour"],
    ["butter", "oil"],
    ["white sugar", "brown sugar", "honey", "maple syrup"],
    ["eggs"],
    ["baking soda", "baking powder"],
    ["vanilla extract", "spices"],
    ["chocolate chips", "nuts", "dried fruits"],
    ["salt"],
    ["oats", "shredded coconut", "granola"],
    ["sprinkles", "frosting"],
    ["milk", "water"],
    ["cream of tartar"]
  ];
  
  // Example usage:
  console.log("Categories: ", cookieCategories);
  console.log("Ingredients by Category: ", ingredientsByCategory);
  
  // Accessing specific category and its ingredients
  const categoryIndex = 2; // For example, Sweetener
  console.log(`Ingredients in ${cookieCategories[categoryIndex]}: `, ingredientsByCategory[categoryIndex]);
  