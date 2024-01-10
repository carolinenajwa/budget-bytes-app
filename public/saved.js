async function fetchUserSaves(userID) {
    try {
        const response = await fetch(`http://localhost:3001/saved`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'user-log-id': userID
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch users saved recipes');
        }
        const userSaved = await response.json();
        const recipes = userSaved[0];  
        return recipes;
    } catch (error) {
        console.error('Error:', error);
        return;
    }
}

async function fetchSavesByCollection(userID, collection) {
    try {
        const response = await fetch(`http://localhost:3001/saved/collections/${collection}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'user-log-id': userID
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch users saved recipes');
        }
        const userSaved = await response.json();
        const recipes = userSaved[0];  
        return recipes;
    } catch (error) {
        console.error('Error:', error);
        return;
    }
}

async function deleteFromSaved(userID, recipeID) {
    try {
        const response = await fetch(`http://localhost:3001/saved/recipe/${recipeID}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'user-log-id': userID
            }
        });
        if (!response.ok) {
            throw new Error('Failed to delete recipe from saved.');
        }
        $('.tab-content').empty();
        await displayCollections(userID); 
    } catch (error) {
        console.error('Error:', error);
    }
}

async function addToCollection(recipeID, addCollection, userID, newCollection) {
    try {
        const response = await fetch(`http://localhost:3001/saved/collections/collection/${recipeID}`, {
            method : 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'user-log-id': userID
            },
            body: JSON.stringify({ collection: addCollection })
        });
        if (response.ok) {
            const message = newCollection ? "Added to" : "Moved to";
            const targetMsg = newCollection ? "#addedMsg" : "#updatedMsg";
            const modal = newCollection ? "#newCollectionModal" : "#collectionModal";
            $(targetMsg).append($(`<p>${message} ${addCollection}</p>`));
            setTimeout(() => {  
                $(modal).modal("hide");
                $(targetMsg).empty();
            }, 1000);        
            $('.tab-content').empty();
            await displayCollections(userID); 
        }     
      } catch (error) {
        console.log('Error:', error);
    }
}

async function displayRecipeCards(userID, collection, allRecipes) {
    $("#msgContainer").empty();
    let recipes;
    if (collection == "all") {
        recipes = allRecipes
    } else {
        recipes = await fetchSavesByCollection(userID, collection);
    } 
    if (recipes.length == 0) {
        const msgDiv = $("<div>", {class: "startDiv"});
        const message = $("<h5>", {class: "startMsg"}).text("Chat with Budget Bytes to save recipes! Simply click the bookmark icon beside a recipe to store it in your saved recipes.");
        msgDiv.append(message);
        $('.tab-content').append(msgDiv);
    }  
    if (collection !== "") {
        const formattedCollection = collection.includes(' ') ? collection.replace(/\s+/g, '') : collection;
        const tabContent = $("<div>", { "id": `${formattedCollection}Content`, "role": "tabpanel", "aria-labelledby": `${formattedCollection}Tab` }).addClass("tab-pane fade");
        if (collection == "all") {
            tabContent.addClass("show active");
        }
        recipes.forEach(recipe => {
            const recipeCard = $("<div>").addClass("recipe-card")
            const recipeDetails = $("<div>").addClass("recipe-details");
        
            console.log("Recipe", recipe);
            console.log("Recipe recipe", recipe.recipe);
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
            recipeCard.data("collection", recipe.collection);
            recipeCard.data("recipeID", recipe.recipeID);
            // Append the created recipe details to the card
            recipeCard.on("click", () => handleRecipeSelection(recipeCard));
            recipeCard.append(recipeDetails);
            tabContent.append(recipeCard);
        });
        $('.tab-content').append(tabContent);
    }
}

async function displayCollections(userID) {
    $("#msgContainer").empty();
    $('#collectionsMenu').empty();
    $('.tab-content').empty();
    const items = $("<ul>").addClass("nav nav-pills flex-column").attr("id", "myTab").attr("role", "tablist");
    const collections = await fetchCollections(userID);
    const title = $("<li>").addClass("nav-item").append($("<h4>Collections</h4>"));
    items.append(title);
    const allTab = $("<li>").addClass("nav-item");
    const allLink = $("<a>", {id: `allTab`, class: "nav-link active", "data-bs-toggle": "pill", "href": `#allContent`, "role": "tab", "aria-controls": `all`}).text('All');
    allTab.append(allLink);
    items.append(allTab);

    console.log(collections);
    const collectionNames = collections.map(collection => collection['']);
    const allRecipes = await fetchUserSaves(userID);
    collectionNames.forEach(async collection => {
        if (collection !== "") {
            const collectionLower = collection.toLowerCase();
            const formattedCollection = collectionLower.includes(' ') ? collectionLower.replace(/\s+/g, '') : collection;
            const item = $("<li>").addClass("nav-item");
            const link = $("<a>", {id: `${formattedCollection}Tab`, class: "nav-link", "data-bs-toggle": "pill", "href": `#${formattedCollection}Content`, "role": "tab", "aria-controls": `${formattedCollection}`, "aria-selected": false}).text(`${collection}`);
            item.append(link);
            items.append(item);
            await displayRecipeCards(userID, collectionLower, allRecipes);
        }
    })
    await displayRecipeCards(userID, "all", allRecipes);
    // menu.append(items);
    $('#collectionsMenu').append(items);
    $('#collectionsMenu').on('click', (event) => {
        if (event.target.text !== "All") {
            $("#removeContainer").empty();
            const removeBtn = $("<button>", {type: "button", class: "btn btn-warning", id: "removeBtn", 'data-bs-target':"#confirmModal", 'data-bs-toggle':"modal"})
                .text(`Remove From ${event.target.text} Collection`);
            $("#removeContainer").append(removeBtn);
        } else {
            $("#removeContainer").empty();
        }
        console.log(event.target.text)
    });
}

async function fetchCollections(userID) {
    try {
        const response = await fetch(`http://localhost:3001/saved/collections`, {
            method : 'GET',
            headers: {
                'Content-Type': 'application/json',
                'user-log-id': userID
            },
        });
        if (response.ok) {
            const collections = await response.json();
            return collections;
        }     
      } catch (error) {
        console.log('Error:', error);
    }
}

function createCollection(recipeID) {
    $("#collectionModal").modal("hide");
    $(".new-collection").empty();
    $("#newCollectionModal").modal("show");
    const input = $('<input>', {type: "text", class: "form-control", placeholder: "Title", id: "newCollection"})
    const userID = getCurrentUserID();
    $('.new-collection').append(input);
    $('#createBtn').off("click").on("click", async () => {
        await addToCollection(recipeID, input.val(), userID, true);
    });
}

 /**
 * Display a more detailed recipe card about the selected recipe in a modal.
 * @param {Object} selectedRecipe - The selected recipe object containing its details.
 */
 async function handleRecipeSelection(selectedRecipe) {
    const collection = selectedRecipe.data("collection");
    const name = selectedRecipe.find('.recipe-details > p').text();
    const ingredients = selectedRecipe.data("ingredients").clone();
    const instructions = selectedRecipe.data("instructions").clone();
    const userID = getCurrentUserID();
    // Update the modal content with the selected recipe details
    $("#recipeName").text(name);
    $("#recipeIngredients").empty().append(ingredients);
    $("#recipeInstructions").empty().append(instructions);
    // Show the modal
    $("#recipeModal").modal("show");
    const recipeID = selectedRecipe.data("recipeID");
    $("#removeBtn").on("click", () => {
        $("#yesBtn").off("click").on("click", () => addToCollection(recipeID, "", userID, false));
    });
    $("#delSaved").on("click", () => {
        $("#yesBtn").off("click").on("click", () => deleteFromSaved(userID, recipeID));
    })
    await genCollectionOptions(collection, recipeID);
}

async function genCollectionOptions(selectedCollection, recipeID) {
    $('#collectionOptions').empty();
    const collections = await fetchCollections(getCurrentUserID());
    const createNew = $('<button>', {type: "button", id: "createCollBtn", class: "btn btn-light"}).text("Create new collection");
    createNew.on("click", () => createCollection(recipeID));
    const field = $('<fieldset>').addClass("form-group");
    const legend = $('<legend>', { class: "mt-4"}).html("Collections");
    field.append(legend);
    const collectionNames = collections.map(collection => collection['']);
    collectionNames.forEach(async collection => {
        if (collection !== "") {
            const formDiv = $('<div>', { class: "form-check collOpt"});
            const input = $('<input>', {class: "form-check-input", type: "radio", name: "collectionOptions", id: `${collection}Radio`, value: `${collection}`});
            if (collection === selectedCollection) {
                input.attr("checked", true);
            }
            input.off('change').on('change', (event) => updateCollection(recipeID, event.target));
            const label = $('<label>', {class: "form-check-label", for: `${collection}Radio`}).text(`${collection}`);
            formDiv.append(input);
            formDiv.append(label);
            field.append(formDiv);
        }
    });
    $(createNew).insertAfter(legend);
    $('#collectionOptions').append(field);
}

function updateCollection(recipeID, selectedVal) {
    $("#saveBtn").off("click").on("click", async () => {
        const userID = await getCurrentUserID();
        await addToCollection(recipeID, selectedVal.value, userID, false);
    });
}

$(document).ready(async function() {
    if (getCurrentUserID() !== "") {
        await displayCollections(getCurrentUserID());
        $('<h1>Saved Recipes</h1>').insertBefore($('#collectionsMenu'));
    }
});