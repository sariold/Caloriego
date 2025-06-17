let items = [];
let isScanning = false; // Track scanner state

// Load items from cookies when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  loadItemsFromCookies();
  showScannerPreview(false);
});

// Sanitize numeric inputs to allow only numbers and decimals
document.querySelectorAll("input.numeric").forEach((input) => {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/[^0-9.]/g, "");
  });
});

// Add item when Enter key is pressed anywhere (except when scanning)
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !isScanning) {
    addItem();
  }
});

// Update heading dynamically based on recipe name input
document.getElementById("recipeName").addEventListener("input", function () {
  const recipeName = this.value.trim();
  document.getElementById("recipeHeading").innerText = recipeName
    ? `${recipeName}:`
    : "Items Added:";
});

// Capture screenshot of recipe-content using html2canvas
function captureScreenshot() {
  // Hide delete buttons to keep image clean
  const deleteButtons = document.querySelectorAll(".delete-btn");
  deleteButtons.forEach((btn) => (btn.style.display = "none"));

  html2canvas(document.getElementById("recipe-content"), { scale: 2 }).then(
    (canvas) => {
      // Restore delete buttons visibility
      deleteButtons.forEach((btn) => (btn.style.display = "block"));

      const recipeName =
        document.getElementById("recipeName").value.trim() || "Recipe";
      const imgData = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = imgData;
      link.download = `${recipeName}.png`;
      link.click();
    }
  );
}

// Bind screenshot button
document
  .getElementById("generateButton")
  .addEventListener("click", captureScreenshot);

// Cookie helpers
function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + d.toUTCString();
  }
  document.cookie = `${name}=${value || ""}${expires}; path=/`;
}

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let c of ca) {
    c = c.trim();
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
  }
  return null;
}

function eraseCookie(name) {
  document.cookie = `${name}=; Max-Age=-99999999;`;
}

// Save current items array to cookies
function saveItemsToCookies() {
  setCookie("calorieItems", JSON.stringify(items), 7);
}

// Load items from cookies and display
function loadItemsFromCookies() {
  const itemsJSON = getCookie("calorieItems");
  if (itemsJSON) {
    try {
      items = JSON.parse(itemsJSON);
    } catch {
      items = [];
    }
  }
  displayItems();
  calculateTotal();
}

// Reset app state & clear cookies
function resetItemsAndCookies() {
  items = [];
  displayItems();
  calculateTotal();
  eraseCookie("calorieItems");
  document.getElementById("recipeName").value = "";
  document.getElementById("recipeHeading").innerText = "Items Added:";
}

// Add a new item based on input values
function addItem() {
  const itemName = document.getElementById("itemName").value.trim();
  const itemServingSizeStr = document
    .getElementById("itemServingSize")
    .value.trim();
  const itemCaloriesPerServing = parseFloat(
    document.getElementById("itemCaloriesPerServing").value.replace(",", ".")
  );
  const itemFat = parseFloat(
    document.getElementById("itemFat").value.replace(",", ".")
  );
  const itemCarbs = parseFloat(
    document.getElementById("itemCarbs").value.replace(",", ".")
  );
  const itemFiber = parseFloat(
    document.getElementById("itemFiber").value.replace(",", ".")
  );
  const itemProtein = parseFloat(
    document.getElementById("itemProtein").value.replace(",", ".")
  );
  const myServing = parseFloat(
    document.getElementById("myServing").value.replace(",", ".")
  );

  // Extract numeric serving size from string
  const servingSizeMatch = itemServingSizeStr.match(/([\d.,]+)/);
  const itemServingSize = servingSizeMatch
    ? parseFloat(servingSizeMatch[1].replace(",", "."))
    : NaN;

  // Validate inputs
  if (
    !itemName ||
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

  // Scale nutrient values based on serving size
  function scale(value) {
    return (myServing / itemServingSize) * value;
  }

  items.push({
    name: itemName,
    calories: scale(itemCaloriesPerServing),
    fat: scale(itemFat),
    carbs: scale(itemCarbs),
    fiber: scale(itemFiber),
    protein: scale(itemProtein),
  });

  displayItems();
  calculateTotal();
  saveItemsToCookies();

  // Clear input fields except recipeName
  [
    "itemName",
    "itemServingSize",
    "itemCaloriesPerServing",
    "itemFat",
    "itemCarbs",
    "itemFiber",
    "itemProtein",
    "myServing",
  ].forEach((id) => {
    document.getElementById(id).value = "";
  });
}

// Display all items with delete buttons
function displayItems() {
  const itemsList = document.getElementById("items");
  itemsList.innerHTML = "";
  items.forEach((item, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${index + 1}. ${item.name}:</strong>
      Calories: ${item.calories.toFixed(2)},
      Fat: ${item.fat.toFixed(2)}g,
      Carbs: ${item.carbs.toFixed(2)}g,
      Fiber: ${item.fiber.toFixed(2)}g,
      Protein: ${item.protein.toFixed(2)}g
    `;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";
    deleteBtn.onclick = () => deleteItem(index);

    const btnContainer = document.createElement("div");
    btnContainer.className = "delete-btn-container";
    btnContainer.appendChild(deleteBtn);

    li.appendChild(btnContainer);
    itemsList.appendChild(li);
  });
}

// Delete item at given index
function deleteItem(index) {
  items.splice(index, 1);
  displayItems();
  calculateTotal();
  saveItemsToCookies();
}

// Calculate and display totals
function calculateTotal() {
  const totals = items.reduce(
    (acc, item) => {
      acc.calories += item.calories;
      acc.fat += item.fat;
      acc.carbs += item.carbs;
      acc.fiber += item.fiber;
      acc.protein += item.protein;
      return acc;
    },
    { calories: 0, fat: 0, carbs: 0, fiber: 0, protein: 0 }
  );

  document.getElementById(
    "total-calories"
  ).innerText = `Total Calories: ${totals.calories.toFixed(2)}`;
  document.getElementById(
    "total-fat"
  ).innerText = `Total Fat: ${totals.fat.toFixed(2)}g`;
  document.getElementById(
    "total-carbs"
  ).innerText = `Total Carbs: ${totals.carbs.toFixed(2)}g`;
  document.getElementById(
    "total-fiber"
  ).innerText = `Total Fiber: ${totals.fiber.toFixed(2)}g`;
  document.getElementById(
    "total-protein"
  ).innerText = `Total Protein: ${totals.protein.toFixed(2)}g`;
}

// Barcode scanner setup with QuaggaJS
const startScanBtn = document.getElementById("start-scan");
const stopScanBtn = document.getElementById("stop-scan");

startScanBtn.addEventListener("click", () => {
  if (isScanning) return;

  showScannerPreview(true);

  Quagga.init(
    {
      inputStream: {
        type: "LiveStream",
        target: document.querySelector("#scanner-preview"),
        constraints: { facingMode: "environment" },
      },
      decoder: {
        readers: ["ean_reader"], // UPC/EAN codes
      },
      locate: true,
    },
    (err) => {
      if (err) {
        console.error("Quagga init error:", err);
        alert("Error initializing barcode scanner: " + err.message);
        showScannerPreview(false); // Hide preview if error
        return;
      }
      Quagga.start();
      isScanning = true;
      startScanBtn.disabled = true;
      stopScanBtn.disabled = false;
    }
  );

  Quagga.onDetected((result) => {
    if (!result || !result.codeResult || !result.codeResult.code) return;

    const code = result.codeResult.code;
    console.log("Barcode detected:", code);
    stopScanner();
    fetchNutritionData(code);
  });
});

// Stop scanner function
function stopScanner() {
  if (isScanning) {
    Quagga.stop();
    isScanning = false;
    startScanBtn.disabled = false;
    stopScanBtn.disabled = true;
    showScannerPreview(false);
  }
}

// Stop scan button event
stopScanBtn.addEventListener("click", stopScanner);

function showScannerPreview(show) {
  const preview = document.getElementById("scanner-preview");
  preview.style.display = show ? "block" : "none";
}

// Fetch nutrition data from Open Food Facts API and autofill form
async function fetchNutritionData(barcode) {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );
    const data = await res.json();

    if (data.status === 1) {
      const product = data.product;
      const nutriments = product.nutriments || {};

      const getValue = (nutrient) => {
        return nutriments[nutrient] !== undefined ? nutriments[nutrient] : "";
      };

      // Autofill inputs directly with raw values
      document.getElementById("itemName").value = product.product_name || "";
      document.getElementById("itemServingSize").value =
        product.serving_size || "";
      document.getElementById("itemCaloriesPerServing").value =
        getValue("energy-kcal");
      document.getElementById("itemFat").value = getValue("fat");
      document.getElementById("itemCarbs").value = getValue("carbohydrates");
      document.getElementById("itemFiber").value = getValue("fiber");
      document.getElementById("itemProtein").value = getValue("proteins");
    } else {
      alert("Product not found in Open Food Facts.");
    }
  } catch (error) {
    console.error("Error fetching nutrition info:", error);
    alert("Failed to fetch product information.");
  }
}
