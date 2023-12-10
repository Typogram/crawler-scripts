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

/**
 * Script for Extracting Palette Data from ColourLovers
 *
 * Description:
 * This script is specifically written to run on the 'Most Loved' palettes page of ColourLovers.
 * URL: https://www.colourlovers.com/palettes/most-loved/all-time/meta
 *
 * Usage:
 * The script is designed to be used with the Tampermonkey extension in a web browser.
 * It automatically loops through the pagination of the specified URL,
 * extracting data from each page and storing it in the browser's localStorage.
 *
 * Functionality:
 * - updateDetailsArray: Extracts palette details such as favorite number and color hex values from each palette displayed on the page.
 * - rgbToHex: Converts RGB color values to Hexadecimal format.
 * - goToNextPage: Automatically navigates to the next page in the pagination.
 * - processPage: Processes the current page to extract palette details and then navigates to the next page.
 * - The script initially triggers the processPage function after a 2000ms delay to ensure that the page's content is fully loaded.
 *
 * Data Storage:
 * The extracted palette details are stored in the browser's localStorage in an array format.
 * Each entry includes the favorite count and the array of color hex values for the respective palette.
 *
 * Note:
 * The script relies on the specific structure of the ColourLovers website.
 * Any changes in the website's layout or class names may require updates to the script.
 * The script is designed to handle unique palettes only, avoiding duplicates in the storage.
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
