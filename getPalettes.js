// ==UserScript==
// @name         getPalettes
// @namespace    https://www.colourlovers.com
// @version      0.1
// @description  This script is designed to crawl the 'Most Loved' palettes page on ColourLovers, aggregate palette data, and save it to a local indexedDB. It works with TamperMonkey, a Chrome extension, allowing it to navigate through pagination and download data.
// @author       You
// @match        https://www.colourlovers.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant        none
// ==/UserScript==

/* 
This script is designed to crawl the 'Most Loved' palettes page on ColourLovers, 
aggregate palette data, and save it to a local indexedDB. It works with TamperMonkey,
a Chrome extension, allowing it to navigate through pagination and download data.
The script includes:
- updateDetailsArray: Fetches and processes palette information from the current page.
- rgbToHex: Converts RGB color format to Hex format.
- goToNextPage: Navigates to the next page in the palette list by simulating a click on the 'Next' button.
- processPage: Processes the current page, updates details array with current page's palettes, and navigates to the next page.
- Initial setup: Calls processPage after a set delay to ensure page content is loaded. 
*/

(function() {
    'use strict';
    function updateDetailsArray() {
        // Retrieve the stored details array from localStorage, or create a new one if it doesn't exist
        var detailsArray = JSON.parse(localStorage.getItem('detailsArray')) || [];

        const detailRows = document.querySelectorAll('.detail-row');

        detailRows.forEach(row => {
            const favoriteNumberText = row.querySelector('.meta .big-number-label h4').textContent;
            const favoriteNumber = parseInt(favoriteNumberText.replace(/,/g, ''), 10);

            const overlay = row.querySelector('.detail-row-overlay');
            const colorDivs = overlay.querySelectorAll('.c');
            const colors = Array.from(colorDivs).map(div => div.style.backgroundColor);

            const hexColors = colors.map(rgb => rgbToHex(rgb)).filter((color, index, self) => self.indexOf(color) === index);

            const colorsString = JSON.stringify(hexColors);
            const isUnique = !detailsArray.some(item => JSON.stringify(item.colors) === colorsString);

            if (isUnique) {
                detailsArray.push({
                    favoriteNumber,
                    colors: hexColors
                });
            }
        });

        // Save the updated array back to localStorage
        localStorage.setItem('detailsArray', JSON.stringify(detailsArray));

        console.log(detailsArray);
    }

    // Helper function to convert RGB to Hex
    function rgbToHex(rgb) {
        if (!rgb) return ''; // If no RGB value, return empty string.
        const [r, g, b] = rgb.match(/\d+/g).map(Number);
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }

    // Now we need a function that navigates to the next page when called
    function goToNextPage() {
        const nextPageButton = document.querySelector('.paging a.pagination__next');
        if (nextPageButton) {
            nextPageButton.click();
        } else {
            console.log('No more pages to navigate to.');
        }
    }

    // And you would call this function after some delay to ensure data is loaded
    function processPage() {
        updateDetailsArray();
        goToNextPage();
    }


    setTimeout(function() {
        processPage();
    }, 2000);

})();
