let noRecipes = false;
let noFaveRecipes = false;

async function fetchAllRecipes() {
    const response = await fetch(`http://localhost:3001/history/all`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const otherRecipes = await response.json();
    const recipes = otherRecipes[0];  
    return recipes;
}

async function fetchAllFaveRecipes() {
    const response = await fetch(`http://localhost:3001/favorite/all`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();   
    const recipes = data[0];  
    return recipes;
}

async function fetchOtherRecipes(userID) {
    const response = await fetch(`http://localhost:3001/explore/${userID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const otherRecipes = await response.json();  
    if (response.status === 400) {
        noRecipes = true;
    }
    return otherRecipes;
}

async function fetchOtherFavorites(userID) {
    const response = await fetch(`http://localhost:3001/explore/favorites/${userID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();   
    if (response.status === 400) {
        noFaveRecipes = true;
        return data;
    }
    const recipes = data[0];  
    return recipes;
}

async function fetchUserPreferences(userID) {
    const response = await fetch(`http://localhost:3001/user/${userID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = response.json();
    console.log(data);
    return data;
}

async function displayMsgAndFetchRecipes(userID) {
    const msgContainer = $("#msgContainer");
    msgContainer.empty();
  
    const fetchAndDisplayRecipes = async (recipes, tabId, message, noFlag) => {
      if (!noFlag) {
        await displayRecipeCards(recipes, tabId);
      } else {
        const tabContent = $("<div>", { "id": `${tabId}Content`, "role": "tabpanel", "aria-labelledby": `${tabId}Tab` }).addClass("tab-pane fade");
        tabContent.append(`<h4>${message}</h4>`);
        $('.tab-content').append(tabContent);
      }
    };
  
    if (userID !== "") {
      msgContainer.append(`<h4>Retrieving recipes...</h4>`);
  
      const allRecipes = await fetchAllRecipes();
      await displayRecipeCards(allRecipes, 'allHistory');

      const allFaveRecipes = await fetchAllFaveRecipes();
      await displayRecipeCards(allFaveRecipes, 'allFaves');
  
      const othersRecipes = await fetchOtherRecipes(userID);
      await fetchAndDisplayRecipes(othersRecipes, 'byPref', othersRecipes.message, noRecipes);
  
      const otherFavorites = await fetchOtherFavorites(userID);
      await fetchAndDisplayRecipes(otherFavorites, 'favesByPref', otherFavorites.message, noFaveRecipes);
    } else {
      msgContainer.append(`<h4>Retrieving recipes...</h4>`);
  
      const recipes = await fetchAllRecipes();
      await displayRecipeCards(recipes, 'allHistory');

      const allFaveRecipes = await fetchAllFaveRecipes();
      await displayRecipeCards(allFaveRecipes, 'allFaves');
  
      msgContainer.empty();
      console.log($(".tab-content"));
  
      const prefTabContent = $("<div>", { "id": `byPrefContent`, "role": "tabpanel", "aria-labelledby": `byPrefTab` }).addClass("tab-pane fade");
      prefTabContent.append(`<h4>Log in to see a curated list of recipes based on your dietary preferences.</h4>`);
      const favePrefTabContent = $("<div>", { "id": `favesByPrefContent`, "role": "tabpanel", "aria-labelledby": `favesByPrefTab` }).addClass("tab-pane fade");
      favePrefTabContent.append(`<h4>Log in to see a curated list of popular recipes based on your dietary preferences.</h4>`);
      $('.tab-content').append(prefTabContent, favePrefTabContent);
    }
}
  
async function displayRecipeCards(recipes, name) {
    $("#msgContainer").empty();
    const tabContent = $("<div>", { "id": `${name}Content`, "role": "tabpanel", "aria-labelledby": `${name}Tab` }).addClass("tab-pane fade");
    if (name == "allHistory") {
        tabContent.addClass("show active");
    }
    console.log(name, recipes);
    recipes.forEach(recipe => {
        const recipeCard = $("<div>").addClass("recipe-card")
        const recipeDetails = $("<div>").addClass("recipe-details");
        
        // Parse HTML content for ingredients
        const ingredientsList = $('<div>', {id: "ingredients"}).append('<p>').html(recipe.recipe.ingredients);
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
        recipeCard.data("ingredients", ingredientsList.clone());
        recipeCard.data("instructions", instructionsList.clone());
        recipeCard.data("recipeID", recipe.recipeID);    
        
        // Append the created recipe details to the card
        recipeCard.on("click", () => handleRecipeSelection(recipeCard));
        recipeCard.append(recipeDetails);
        tabContent.append(recipeCard);
    });
    if (getCurrentUserID() !== "" && (name === 'byPref' || name === 'favesByPref')) {
        const fetchedData = await fetchUserPreferences(getCurrentUserID());
        const preferences = (fetchedData.recordset)[0];
        const message = constructMessage(preferences);
        $("#msgContainer").append(`<h4>${message}</h4>`);
    }
    $('.tab-content').append(tabContent);
}

function createMenu() {
    const tabsData = [
      { id: 'allHistory', text: 'All', active: true },
      { id: 'allFaves', text: 'Popular Recipes', active: false },
      { id: 'byPref', text: 'By Preference', active: false },
      { id: 'favesByPref', text: 'Popular Recipes By Preference', active: false }
    ];
  
    const items = $('<ul>').addClass('nav nav-pills flex-column').attr('id', 'myTab').attr('role', 'tablist');
    items.append($('<li>').addClass('nav-item').append($('<h4>Recipes</h4>')));
  
    tabsData.forEach(tab => {
      const tabItem = $('<li>').addClass('nav-item');
      const tabLink = $('<a>', {
        id: `${tab.id}Tab`,
        class: `nav-link${tab.active ? ' active' : ''}`,
        'data-bs-toggle': 'pill',
        href: `#${tab.id}Content`,
        role: 'tab',
        'aria-controls': tab.id
      }).text(tab.text);
  
      tabItem.append(tabLink);
      items.append(tabItem);
    });
  
    $('#exploreMenu').append(items);
}

function constructMessage(obj) {
    count = 0;
    let resultString = "Here are "
    let preferences = []
    for (const key in obj) {
        if (obj.hasOwnProperty(key) && key !== 'userLogID' && obj[key] === 'true') {
            if (key === 'isDairyFree') {
                preferences.push("dairy free");
            } else if (key === 'isLowCarb') {
                preferences.push("Low carb");
            } else {
                preferences.push(key.substring(2).toLowerCase());
            }
        }
    }
    if (preferences.length === 1) {
        resultString += preferences[0] + " ";
    } else if (preferences.length === 2) {
        resultString += preferences.join(" & ") + " ";
    } else if (preferences.length === 0) {
        resultString += "";
    } else {
        resultString += preferences.slice(0, -1).join(", ") + ", and " + preferences.slice(-1) + " ";
    }
    resultString += "recipes from other Budget Bytes users"
    return resultString;
}

 /**
 * Display a more detailed recipe card about the selected recipe in a modal.
 * @param {Object} selectedRecipe - The selected recipe object containing its details.
 */
 function handleRecipeSelection(selectedRecipe) {
    const userID = getCurrentUserID();
    const name = selectedRecipe.find('.recipe-details > p').text();
    const ingredients = selectedRecipe.data("ingredients").clone();
    const instructions = selectedRecipe.data("instructions").clone();
    // Update the modal content with the selected recipe details
    $("#recipeName").text(name);
    $("#recipeIngredients").empty().append(ingredients);
    $("#recipeInstructions").empty().append(instructions);
    if (userID !== "") {
        $("#addCont").empty();
        const button = $("<button>", {type: "button", class:"btn btn-secondary", id: "addToSaved"}).text("Add To Saved");
        $("#addCont").append(button);     
        button.on('click', async function() {
            $("#addedMsg").empty();
            if (result == null) {
                $("#addedMsg").append($(`<p>Could not add to saved</p>`));
            } else {
                $("#addedMsg").append($(`<p>Added to saved</p>`));
            }
        });
    }
    $("#recipeName").text(name);
    $("#recipeIngredients").empty().append(ingredients);
    $("#recipeInstructions").empty().append(instructions);
    // Show the modal
    $("#recipeModal").modal("show");
}

$(document).ready(function() {
    $("#recipeSearch").html("<p>Please wait, loading recipes...</p>");
    displayMsgAndFetchRecipes(getCurrentUserID());  
    createMenu();
});