async function fetchMealPlan(type, userID) {
    try {
        let apiUrl;
        if (type === 'genFave') {
            apiUrl = `http://localhost:3001/mealPlan/favorite/${userID}`
        } else if (type === 'genSaved') {
            apiUrl = `http://localhost:3001/mealPlan/saved/${userID}`
        } else if (type === 'genHistory') {
            apiUrl = `http://localhost:3001/mealPlan/history/${userID}`
        } else if (type === 'favePref') {
            apiUrl = `http://localhost:3001/mealPlan/preference/favorites/${userID}`
        } else if (type === 'allPref') {
            apiUrl = `http://localhost:3001/mealPlan/preference/all/${userID}`
        } else {
            apiUrl = `http://localhost:3001/mealPlan/all`
        }
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if ((type === 'favePref' || type === 'allPref') && response.status === 400) {
            response.json().then(data => {
                $('.recipeCards').append(`<h4 style="margin-top: 20px">${data.message}</h4>`);
            }).catch(error => {
                console.error('Error parsing JSON:', error);
            });
            return;
        }
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        console.log(response);
        return await response.json();
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

let isGenerating = false; // Variable to track if the meal plan generation is in progress

function generateMealPlan(type) {
    if (isGenerating) {
        // If already generating, ignore the click
        return;
    }

    isGenerating = true; // Set the flag to indicate that generation is in progress

    const mealCardsContainer = $('.recipeCards');

    // Clear previous meal plan
    mealCardsContainer.html('');
    const userID = getCurrentUserID();
    // Fetch meal plan
    fetchMealPlan(type, userID)
        .then((mealPlan) => {
            if (typeof mealPlan !== 'undefined') {
                console.log('Fetched Meal Plan:', mealPlan);
                displayRecipeCards(mealPlan[0]);
            }
        })
        .catch((error) => console.error(error))
        .finally(() => {
            isGenerating = false; // Reset the flag when generation is complete
        });
}

async function displayRecipeCards(recipes) {
    const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    const content = $("<div>", {id: "cardContent"});
    if (recipes.length == 0) {
        const msgDiv = $("<div>", {class: "startDiv"});
        const message = $("<h5>", {class: "startMsg"}).text(recipes.message);
        msgDiv.append(message);
        $('.recipeCards').append(msgDiv);
    }
    console.log("Recipes", recipes);
    recipes.forEach((recipe, index) => {
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
        const overlay = $("<div>", {class: "overlay"})
        recipeCard.append(overlay);
        const overlayText = $("<div>", {class: "overlay-text"});
        overlayText.append(`<h3>${daysOfWeek[index]}</h3>`);
        overlay.append(overlayText);
        recipeCard.append(recipeDetails);
        content.append(recipeCard);
    });

    // Check if there are fewer recipes than days of the week
    const remainingDays = 7 - recipes.length;
    if (remainingDays > 0) {
        for (let i = 0; i < remainingDays; i++) {
            const emptyRecipeCard = $("<div>").addClass("recipe-card empty-card");
            const overlay = $("<div>", {class: "overlay"});
            const overlayText = $("<div>", {class: "overlay-text"});
            overlayText.append(`<h3>${daysOfWeek[recipes.length + i]}</h3>`);
            overlayText.append(`<h3>Not enough recipes found</h3>`);
            overlay.append(overlayText);
            emptyRecipeCard.append(overlay);
            content.append(emptyRecipeCard);
        }
    }

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
    // Update the modal content with the selected recipe details
    $("#recipeName").text(name);
    $("#recipeIngredients").empty().append(ingredients);
    $("#recipeInstructions").empty().append(instructions);
    // Show the modal
    $("#recipeModal").modal("show");
}

$(document).ready(async function() {
    $(".generate").on("click", (event) => {
        const id = event.target.id;
        generateMealPlan(id);
    });
    if (getCurrentUserID() === "") {
        $("#genFave, #genSaved, #genHistory, #allPref, #favePref").attr('disabled', true);
        $("#genFave, #genSaved, #genHistory, #allPref, #favePref").wrap('<span class="d-inline-block" tabindex="0" data-toggle="tooltip" data-placement="bottom" title="Log in to use this feature"></span>');
        $('[data-toggle="tooltip"]').tooltip();
    }
});