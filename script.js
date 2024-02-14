var items = [];

// Add event listener to load items from cookies when the DOM content is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  loadItemsFromCookies();
});

// Add event listeners to input fields
document.querySelectorAll("input").forEach(function (input) {
  input.addEventListener("input", function () {
    if (input.classList.contains("numeric")) {
      // Replace non-numeric characters with empty string
      input.value = input.value.replace(/[^0-9.]/g, "");
    }
  });
});

// Add item on Enter key press
document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    addItem();
  }
});

// Add event listener to update the heading text based on recipeName input
document.getElementById("recipeName").addEventListener("input", function () {
  var recipeName = document.getElementById("recipeName").value;
  document.getElementById("recipeHeading").innerText =
    recipeName !== "" ? recipeName + ":" : "Items Added:";
});

// Function to capture the screenshot
function captureScreenshot() {
  // Hide delete buttons before capturing the screenshot
  var deleteButtons = document.querySelectorAll(".delete-btn");
  deleteButtons.forEach(function (button) {
    button.style.display = "none";
  });

  // Capture the screenshot
  html2canvas(document.getElementById("recipe-content"), { scale: 2 }).then(
    function (canvas) {
      // Restore visibility of delete buttons after capturing the screenshot
      deleteButtons.forEach(function (button) {
        button.style.display = "block";
      });

      // Get the recipe name for the filename
      var recipeName = document.getElementById("recipeName").value.trim();
      if (!recipeName) {
        recipeName = "Recipe";
      }

      // Convert the canvas to an image data URL
      var imgData = canvas.toDataURL("image/png");

      // Create a link element to download the image
      var downloadLink = document.createElement("a");
      downloadLink.href = imgData;
      downloadLink.download = recipeName + ".png";
      downloadLink.click();
    }
  );
}

// Add event listener to the generate button
document
  .getElementById("generateButton")
  .addEventListener("click", function () {
    captureScreenshot();
  });

// Function to save items to cookies
function saveItemsToCookies() {
  var itemsJSON = JSON.stringify(items);
  setCookie("calorieItems", itemsJSON, 7); // Expires in 7 days
}

// Function to load items from cookies
function loadItemsFromCookies() {
  var itemsJSON = getCookie("calorieItems");
  if (itemsJSON) {
    items = JSON.parse(itemsJSON);
    displayItems();
  }
  calculateTotal();
}

// Function to reset items and clear cookies
function resetItemsAndCookies() {
  items = [];
  displayItems();
  calculateTotal();
  eraseCookie("calorieItems");
  document.getElementById("recipeName").value = "";
  document.getElementById("recipeHeading").innerText = "Items Added";
}

// Function to set a cookie
function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Function to get a cookie value
function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

// Function to erase a cookie
function eraseCookie(name) {
  document.cookie = name + "=; Max-Age=-99999999;";
}

function addItem() {
  var itemName = document.getElementById("itemName").value;
  var itemServingSize = parseFloat(
    document.getElementById("itemServingSize").value.replace(",", ".")
  );
  var itemCaloriesPerServing = parseFloat(
    document.getElementById("itemCaloriesPerServing").value.replace(",", ".")
  );
  var itemFat = parseFloat(
    document.getElementById("itemFat").value.replace(",", ".")
  );
  var itemCarbs = parseFloat(
    document.getElementById("itemCarbs").value.replace(",", ".")
  );
  var itemFiber = parseFloat(
    document.getElementById("itemFiber").value.replace(",", ".")
  );
  var itemProtein = parseFloat(
    document.getElementById("itemProtein").value.replace(",", ".")
  );
  var myServing = parseFloat(
    document.getElementById("myServing").value.replace(",", ".")
  );

  // Check if all fields are filled
  if (
    itemName.trim() === "" ||
    isNaN(itemServingSize) ||
    isNaN(itemCaloriesPerServing) ||
    isNaN(itemFat) ||
    isNaN(itemCarbs) ||
    isNaN(itemFiber) ||
    isNaN(itemProtein) ||
    isNaN(myServing)
  ) {
    alert("Please fill in all fields with valid values.");
    return;
  }

  var calculatedCalories =
    (myServing / itemServingSize) * itemCaloriesPerServing;
  var calculatedFat = (myServing / itemServingSize) * itemFat;
  var calculatedCarbs = (myServing / itemServingSize) * itemCarbs;
  var calculatedFiber = (myServing / itemServingSize) * itemFiber;
  var calculatedProtein = (myServing / itemServingSize) * itemProtein;

  items.push({
    name: itemName,
    calories: calculatedCalories,
    fat: calculatedFat,
    carbs: calculatedCarbs,
    fiber: calculatedFiber,
    protein: calculatedProtein,
  });

  displayItems();
  calculateTotal();

  // Clear input fields
  document.getElementById("recipeName").value = "";
  document.getElementById("itemName").value = "";
  document.getElementById("itemServingSize").value = "";
  document.getElementById("itemCaloriesPerServing").value = "";
  document.getElementById("itemFat").value = "";
  document.getElementById("itemCarbs").value = "";
  document.getElementById("itemFiber").value = "";
  document.getElementById("itemProtein").value = "";
  document.getElementById("myServing").value = "";

  saveItemsToCookies();
}

function displayItems() {
  var itemsList = document.getElementById("items");
  itemsList.innerHTML = "";
  items.forEach(function (item, index) {
    var li = document.createElement("li");
    li.textContent =
      index +
      1 +
      ". " + // Add numbering
      item.name +
      ": " +
      "Calories: " +
      item.calories.toFixed(2) +
      ", " +
      "Fat: " +
      item.fat.toFixed(2) +
      "g, " +
      "Carbs: " +
      item.carbs.toFixed(2) +
      "g, " +
      "Fiber: " +
      item.fiber.toFixed(2) +
      "g, " +
      "Protein: " +
      item.protein.toFixed(2) +
      "g ";
    var deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-btn";
    deleteButton.onclick = function () {
      deleteItem(index);
    };
    var deleteButtonContainer = document.createElement("div");
    deleteButtonContainer.className = "delete-btn-container";
    deleteButtonContainer.appendChild(deleteButton);
    li.appendChild(deleteButtonContainer);
    itemsList.appendChild(li);
  });
}

function deleteItem(index) {
  items.splice(index, 1);
  displayItems();
  calculateTotal();
  saveItemsToCookies();
}

function calculateTotal() {
  var totalCalories = 0;
  var totalFat = 0;
  var totalCarbs = 0;
  var totalFiber = 0;
  var totalProtein = 0;

  items.forEach(function (item) {
    totalCalories += item.calories;
    totalFat += item.fat;
    totalCarbs += item.carbs;
    totalFiber += item.fiber;
    totalProtein += item.protein;
  });

  document.getElementById("total-calories").innerText =
    "Total Calories: " + totalCalories.toFixed(2);
  document.getElementById("total-fat").innerText =
    "Total Fat: " + totalFat.toFixed(2) + "g";
  document.getElementById("total-carbs").innerText =
    "Total Carbs: " + totalCarbs.toFixed(2) + "g";
  document.getElementById("total-fiber").innerText =
    "Total Fiber: " + totalFiber.toFixed(2) + "g";
  document.getElementById("total-protein").innerText =
    "Total Protein: " + totalProtein.toFixed(2) + "g";
}
