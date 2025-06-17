# Caloriego

**Caloriego** is a mobile-friendly web app that helps you track nutrition information by scanning barcodes or manually entering food item details. You can build custom recipes by adding multiple items and see their combined nutrition totals.

## Features

- Barcode scanning powered by QuaggaJS for quick item entry
- Manual input for item name, serving size, calories, fat, carbs, fiber, and protein
- Adjustable personal serving size for customized tracking
- Add multiple items to create a recipe and view combined nutrition facts
- Generate an image summary of your recipe (using html2canvas)
- Reset option to clear all entered data

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Webcam (for barcode scanning functionality)

### Installation

1. Clone or download this repository
2. Open `index.html` in your web browser

### Usage

- Click **Scan Barcode** to start scanning barcodes of food items
- Fill in or adjust nutrition information fields
- Enter your serving size
- Click **Add** to add the item to your recipe list
- View totals for calories, fat, carbs, fiber, and protein
- Use **Image** button to generate a snapshot of your recipe
- Use **Reset** to clear all data and start fresh

## Technologies Used

- [QuaggaJS](https://github.com/serratus/quaggaJS) — barcode scanning library
- [html2canvas](https://html2canvas.hertzen.com/) — for generating images from DOM elements
- HTML5, CSS3, and vanilla JavaScript
