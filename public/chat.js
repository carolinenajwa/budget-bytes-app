$(document).ready(function () {
    let message = $('#message');
    let conversation = $('#conversation');
    // when a send button is clicked to send a message
    $('#send').on('click', function () {
        // capture the message value from the textbox
        var text = $('#message').val();
        // output on the console window for debugging purposes
        console.log(text);

        // get the current date and time and format time in terms of hours:minutes format
        var hnow = new Date().getHours();
        var mnow = new Date().getMinutes();
        mnow = (mnow < 10) ? ('0' + mnow) : mnow;
        var d = hnow + ":" + mnow;

        // check if the message entered by the user is not empty
        if (text.length > 0) {

            // set the border color to this style
            message.css("border", "1px solid #f4f5f9");

            // append the conversation element to include a new list item containing the (a) message, (b) time
            conversation.append("<li class='message-right'><div class='message-hour'>" + d + " <span class='ion-android-done-all'></span></div><div class='message-avatar'><div class='avatar ion-ios-person user'><img src='images/profile-user.png' alt='User avatar' id='userAvatar'></div><div class='name'>You</div></div><div class='message-text'>" + text + "</div></li>");

            // clear the message textbox
            message.val('');

            openAPIConnect(text, d).then(function (responseData) {
                // Check for unwanted content
                if (responseData.includes("#include") || responseData.includes("printf") || responseData.includes("return 0;")) {
                    responseData = "Sorry, I didn't get that. Can you please rephrase or ask again?";
                }

                // Check for potential recipe details
                if ((responseData.includes("Ingredients") || responseData.includes("Instructions")) || responseData.includes("Directions") && !responseData.includes("ideas")) {
                    // Display the individual recipe details in a structured format
                    let recipeId = new Date().getTime(); // generate unique recipe id
                    displayRecipe(responseData, d, recipeId);
                } else {
                    // Split the responseData into lines
                    var lines = responseData.split('\n');

                    // Check and format lines containing recipe ideas as a list
                    var formattedResponse = lines.map(line => {
                        if (/^\d+\./.test(line.trim())) {
                            return "<li>" + line.trim() + "</li>";
                        }
                        return line;
                    }).join("");

                    // Display the formatted recipe recommendations
                    message.css("border", "1px solid #f4f5f9");
                    conversation.append("<li class='message-left'><div class='message-hour'>" + d + " <span class='ion-android-done-all'></span></div><div class='message-avatar'><div class='avatar ion-ios-person .bot'><img src='images/logo.png' alt='chatGPT avatar' id='chatGPTAvatar'></div><div class='name'>chatGPT</div></div><div class='message-text'><ul id=recipeIdeas>" + formattedResponse + "</ul></div></li>");
                    message.val('');
                }
                console.log(responseData);
            }).catch(function (reason) {
                console.log(reason);
            });

            // adjust the widget converation such that it the recent messages are shown below and earlier ones scroll up
            // $('.widget-conversation').scrollTop($('ul li').last().position().top + $('ul li').last().height());
            $('.widget-conversation').scrollTop(conversation.prop("scrollHeight"));
        } else {
            // show animation for handling invalid or empty message
            message.css("border", "1px solid #eb9f9f");
            message.animate({ opacity: '0.1' }, "slow");
            message.animate({ opacity: '1' }, "slow");
            message.animate({ opacity: '0.1' }, "slow");
            message.animate({ opacity: '1' }, "slow");
        }
    });
});

  // Function to get the current user's ID
function getCurrentUserID() {
    return localStorage.getItem('currentUserLogID');
}

// Function to fetch user dietary preferences
async function fetchUserDietaryPreferences(userID) {
    try {
        const response = await fetch(`http://localhost:3001/user/${userID}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        const userData = await response.json();
        console.log("Fetched user data:", userData);
        return userData.recordset[0];
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

async function getUserDietaryMessage() {
    const currentUserID = getCurrentUserID();
    console.log("Current User ID:", currentUserID);

    let dietaryMessage = "";
    let skillMessage = "";

    if (currentUserID) {
        const userPrefs = await fetchUserDietaryPreferences(currentUserID);

       if (userPrefs) {
           if (userPrefs.isVegan === 'true') {
               dietaryMessage += "It is important that you must only give the user Vegan Recipe suggestions. You must give vegan-version of recipes unless the user specifically says something like 'Give me non-vegan recipes'...";
           }
           if (userPrefs.isVegetarian === 'true') {
               dietaryMessage += "It is important that you must only give the user Vegetarian Recipe suggestions. You must give vegetarian-version of recipes unless the user specifically says something like 'Give me non-vegetarian recipes'...";
           }
           if (userPrefs.isDairyFree === 'true') {
               dietaryMessage += "It is important that you must only give the user Dairy-Free Recipe suggestions. You must give dairy-free-version of recipes unless the user specifically says something like 'Give me non-dairy-free recipes'...";
           }
           if (userPrefs.isLowCarb === 'true') {
               dietaryMessage += "It is important that you must only give the user Low-Carb Recipe suggestions. You must give low-carb-version of recipes unless the user specifically says something like 'Give me non-low-carb recipes'...";
           }
           if (userPrefs.isPescetarian === 'true') {
               dietaryMessage += "It is important that you must only give the user Pescetarian Recipe suggestions. You must give pescetarian-version of recipes unless the user specifically says something like 'Give me non-pescetarian recipes'...";
           }
           if (userPrefs.skillLevel === 'Beginner') {
                skillMessage += "It is important that you must only give the user beginner-level recipe suggestions. You must give beginner-level recipes unless the user specifically says something like 'Give me advanced level recipes'...";
           }
           if (userPrefs.skillLevel === 'Intermediate') {
                skillMessage += "It is important that you must only give the user intermediate-level recipe suggestions. You must give intermediate-level recipes unless the user specifically says something like 'Give me beginner level recipes'...";
            }
            if (userPrefs.skillLevel === 'Advanced') {
                skillMessage += "It is important that you must only give the user advanced-level recipe suggestions. You must give advanced-level recipes unless the user specifically says something like 'Give me intermediate level recipes'...";
            }
       }
    }

    const finalMessage = dietaryMessage + skillMessage;
    console.log(finalMessage);

    return finalMessage;
}


function openAPIConnect(userText) {
    return new Promise(async function (resolve, reject) {
        const dietaryMessage = await getUserDietaryMessage();

        // ADD YOUR API KEY BELOW
        var openAIKey = "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";

        // Specify the model to use
        var serviceModel = "text-davinci-003";
        var serviceEndpoint = 'https://api.openai.com/v1/completions';
        var maxTokens = 250;

        // Custom system message
        var systemMessage = "Your name is BUDGET-BYTE, " +
            "You are a recipe AI assistant designed primarily for college students, " +
            "providing them with a seamless and personalized culinary experience. " +
            "Your main goal is to offer effortless interaction and customized meal " +
            "suggestions based on user queries and available ingredients, " +
            "with a focus on affordability and simplicity.  " +
            "Remember, your primary users are students who seek quick, " +
            "affordable, and delicious meal options. Your recommendations " +
            "and interactions should resonate with the difficulties and preferences of this " +
            "target audience." +
            dietaryMessage +
            "At the beginning of your conversation, your greeting to the user should simple, friendly and less than"+
            "Ensure your responses are friendly, concise and to the point. " +
            "Ensure your responses are friendly, concise and to the point. " +
            "When presenting multiple options or steps, format your output in a clear " +
            "list form for better readability and user experience.\n";

        // Prepend user's message with the system message
        var processText = systemMessage + "\n" + userText;

        // Begin establishing the HTTP Request to web service endpoint
        var serviceRequest = new XMLHttpRequest();
        serviceRequest.open("POST", serviceEndpoint);
        serviceRequest.setRequestHeader("Accept", "application/json");
        serviceRequest.setRequestHeader("Content-Type", "application/json");
        serviceRequest.setRequestHeader("Authorization", "Bearer " + openAIKey)

        serviceRequest.onreadystatechange = function () {
            if (serviceRequest.readyState === 4) {
                var responseJSON = {};
                try {
                    responseJSON = JSON.parse(serviceRequest.responseText);
                } catch (ex) {
                    console.log("Error: " + ex.message);
                }

                if (responseJSON.error && responseJSON.error.message) {
                    console.log("Error: " + responseJSON.error.message);
                    reject("something failed");
                } else if (responseJSON.choices) {
                    var responseMessage = JSON.parse(serviceRequest.responseText);
                    var responseText = responseMessage.choices[0].text.trim();
                    resolve(responseText);
                }
            }
        };

        const data = {
            model: serviceModel,
            prompt: processText,
            temperature: 0.5,
            max_tokens: maxTokens
        };

        serviceRequest.send(JSON.stringify(data));
    });
}

function displayRecipe(recipeDetails, d, recipeID) {
    const lines = recipeDetails.split('\n');

    let ingredients = [];
    let instructions = [];
    let isInstructions = false;
    let recipeName = '';

    const ingredientsIndex = recipeDetails.toLowerCase().indexOf('ingredients:');
    const dashIndex = recipeDetails.indexOf('-');

    if (ingredientsIndex !== -1) {
        recipeName = recipeDetails.substring(0, ingredientsIndex).trim();
    } else if (dashIndex !== -1) {
        // Checking if the character after the dash is a space or the dash is at the start of the string
        if (recipeDetails[dashIndex + 1] === ' ' || dashIndex === 0) {
            recipeName = recipeDetails.substring(0, dashIndex).trim();
        }
    } else {
        // If neither 'Ingredients:' nor '-' found, take the first line as the recipe name
        const lines = recipeDetails.split('\n');
        recipeName = lines[0].trim();
    }

    lines.forEach(line => {
        line = line.trim();

        if (line.startsWith('Instructions:') || line.startsWith('Directions:')) {
            isInstructions = true;
        } else if (line.startsWith('-')) {
            isInstructions = false;
        }

        if (isInstructions) {
            if (line !== "") {
                instructions.push('<li>' + line.replace(/^\d+\.\s/,'') + '</li>');
            }
        } else {
            if (line.trim().startsWith('-')) {
                ingredients.push('<li>' + line.trim().substring(1) + '</li>');
            }
        }
    });

    // Remove 'Ingredients' and 'Instructions' if present
    if (ingredients.length > 0 && ingredients[0].toLowerCase().includes('ingredients')) {
        ingredients.shift();
    }

    if (instructions.length > 0 && instructions[0].toLowerCase().includes('instructions' || 'directions')) {
        instructions.shift();
    }
    
    const savedRecipeID = recipeID;
    const userLogID = getCurrentUserID();

    if (userLogID !== "") {
        addToHistory(recipeID, userLogID, recipeName, ingredients, instructions);
    }

    $('#message').css("border", "1px solid #f4f5f9");
    const message = `<li class='message-left'>
                        <div class='message-hour'>${d} <span class='ion-android-done-all'></span></div>
                        <div class='message-avatar'>
                            <div class='avatar ion-ios-person .bot'>
                                <img src='images/logo.png' alt='chatGPT avatar' id='chatGPTAvatar'>
                            </div>
                            <div class='name'>chatGPT</div>
                        </div>
                        <div class='message-text'>
                            <div class='save-button'>
                                <button id='${savedRecipeID}' class='bookmark-button'>
                                    <svg class='bookmark-icon' viewBox='0 0 24 24'>
                                        <path class='bookmark-shape' d='M2 2v13.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2'>
                                    </svg>
                                </button>
                            </div>
                            <div class='favorite-button'>
                                <button id='${recipeID}' class='heart-button'>
                                    <svg class='heart-icon' viewBox='0 0 24 24'>
                                        <path class='heart-shape' d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'>
                                    </svg>
                                </button>
                            </div>
                            <p>${recipeName}</p>
                            <h4>Recipe Details</h4>
                            <p>Ingredients:</p>
                            <ul>${ingredients.join('')}</ul>
                            <p>Instructions:</p>
                            <ol>${instructions.join('')}</ol>
                        </div>
                    </li>`
    // Display the formatted recipe details
    $('#conversation').append(message);
    $('#message').val('');


    $('#' + savedRecipeID + ', #' + recipeID).on('click', function (e) {
        e.stopPropagation(); // Prevents event bubbling
        let clickedButton = $(this);
        let recipeID = clickedButton.attr('id');
        let userLogID = getCurrentUserID();
        console.log(clickedButton);

        if (userLogID === "") {
            alert("Please log in or create an account to save or favorite a recipe");
            return;
        }
    
        if (clickedButton.hasClass('heart-button')) {
            // Heart button clicked
            handleButtonClick('favorite', recipeID, userLogID, clickedButton, `favorite/${recipeID}`, 'favorite', recipeName, ingredients, instructions);
        } else if (clickedButton.hasClass('bookmark-button')) {
            // Bookmark button clicked
            handleButtonClick('saved', recipeID, userLogID, clickedButton, `saved/recipe/${recipeID}`, 'saved', recipeName, ingredients, instructions);
        }
    });
}

async function handleButtonClick(className, recipeID, userLogID, button, deleteEndpoint, postEndpoint, recipeName, ingredients, instructions) {
    if (button.hasClass(className)) {
        button.removeClass(className);
        fetch(`http://localhost:3001/${deleteEndpoint}`, {
            method: 'DELETE',
            headers: {
                'user-log-id': userLogID
            }
        })
        .then(response => {
            if (response.ok) {
                console.log(`Removed from ${className}!`);
            } else {
                console.error(`Error removing from ${className}.`);
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
    } else {
        button.addClass(className);
        // Send a POST request to add to favorites
        fetch(`http://localhost:3001/${postEndpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'user-log-id': userLogID
            },
            body: JSON.stringify({ id: recipeID, recipe: JSON.stringify({name: recipeName, ingredients: ingredients, instructions: instructions})})
        })
        .then(response => {
            if (response.ok) {
                console.log(`Added to ${className}!`);
            } else {
                console.error(`Error adding to ${className}.`);
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
    }
}

async function addToHistory(recipeID, userLogID, recipeName, ingredients, instructions) {
    console.log(JSON.stringify({ id: recipeID, recipe: JSON.stringify({name: recipeName, ingredients: ingredients, instructions: instructions})}));
    try {
        const response = await fetch(`http://localhost:3001/history`, {
            method : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'user-log-id': userLogID
            },
            body: JSON.stringify({ id: recipeID, recipe: JSON.stringify({name: recipeName, ingredients: ingredients, instructions: instructions})})
        });
        if (response.ok) {
            console.log('Added to recipe history!');
        }     
      } catch (error) {
        console.log('Error:', error);
    }
}
