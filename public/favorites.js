async function fetchUserFavorites(userID) {
    try {
        const response = await fetch(`http://localhost:3001/favorite`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'user-log-id': userID
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch users favorite recipes');
        }
        const userFavorites = await response.json();   
        const recipes = userFavorites[0];  
        return recipes;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

async function removeFromFavorites(userID, recipeID) {
    try {
        const response = await fetch(`http://localhost:3001/favorite/${recipeID}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'user-log-id': userID
            }
        });
        if (!response.ok) {
            throw new Error('Failed to delete recipe from saved.');
        }
        await $('.recipeCards').empty();
        console.log(recipeID, userID);
        displayRecipeCards(userID); 
    } catch (error) {
        console.error('Error:', error);
    }
}

async function displayRecipeCards(userID) {
    $("#msgContainer").empty();
    const recipes = await fetchUserFavorites(userID);
    const content = $("<div>", {id: "cardContent"});
    if (recipes.length == 0) {
        const msgDiv = $("<div>", {class: "startDiv"});
        const message = $("<h5>", {class: "startMsg"}).text("Chat with Budget Bytes to favorite recipes! Simply click the heart icon beside a recipe to store it in your favorite recipes.");
        msgDiv.append(message);
        $('.recipeCards').append(msgDiv);
    }
    recipes.forEach(recipe => {
        const recipeCard = $("<div>").addClass("recipe-card")
        const recipeDetails = $("<div>").addClass("recipe-details");
        
        // Parse HTML content for ingredients
        const ingredientsList = $('<ul>').html(recipe.recipe.ingredients);
        const ingredientItems = ingredientsList.find('li');

        // Extract and append ingredients to the final ingredients list
        const finalIngredientsList = $('<ul>');
        ingredientItems.each(function() {
            const ingredient = $('<li>').text($(this).text());
            finalIngredientsList.append(ingredient);
        });

        // Parse HTML content for instructions
        const instructionsList = $('<ol>').html(recipe.recipe.instructions);
        const instructionItems = instructionsList.find('li');

        // Extract and append instructions to the final instructions list
        const finalInstructionsList = $('<ol>');
        instructionItems.each(function() {
            const instruction = $('<li>').text($(this).text());
            finalInstructionsList.append(instruction);
        });

        // Add recipe name, ingredients list, and instructions list to recipe details
        recipeDetails.append(`<p>${recipe.recipe.name}</p>`);
        recipeDetails.append('<h4>Ingredients:</h4>').append(finalIngredientsList);
        recipeDetails.append('<h4>Instructions:</h4>').append(finalInstructionsList);

        // Attach ingredients and instructions data to the recipe card element
        recipeCard.data("ingredients", finalIngredientsList.clone());
        recipeCard.data("instructions", finalInstructionsList.clone());
        recipeCard.data("recipeID", recipe.recipeID);    
        // Append the created recipe details to the card
        recipeCard.on("click", () => handleRecipeSelection(recipeCard));
        recipeCard.append(recipeDetails);
        content.append(recipeCard);
    });
    console.log(content);
    $('.recipeCards').append(content);
}

 /**
 * Display a more detailed recipe card about the selected recipe in a modal.
 * @param {Object} selectedRecipe - The selected recipe object containing its details.
 */
 function handleRecipeSelection(selectedRecipe) {
    const name = selectedRecipe.find('.recipe-details > p').text();
    const ingredients = selectedRecipe.data("ingredients").clone();
    const instructions = selectedRecipe.data("instructions").clone();
    const recipeID = selectedRecipe.data("recipeID");
    const userID = getCurrentUserID();
    // Update the modal content with the selected recipe details
    $("#recipeName").text(name);
    $("#recipeIngredients").empty().append(ingredients);
    $("#recipeInstructions").empty().append(instructions);
    // Show the modal
    $("#recipeModal").modal("show");
    $("#yesBtn").off("click").on("click", () => removeFromFavorites(userID, recipeID));
}

$(document).ready(async function() {
    if (getCurrentUserID() !== "") {
        await displayRecipeCards(getCurrentUserID());
        $('<h1>Favorite Recipes</h1>').insertBefore($('.recipeCards'));
    }
});