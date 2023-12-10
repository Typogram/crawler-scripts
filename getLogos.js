// ==UserScript==
// @name         getLogos.js
// @namespace    http://tampermonkey.net/
// @version      2023-12-10
// @description  Automatically extracts and saves logo and branding project data from Brand New's archive pages.
// @author       You
// @match        https://www.underconsideration.com/brandnew/archives/category/type/new*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=underconsideration.com
// @grant        none
// ==/UserScript==

/**
 * Script for Extracting Data from Brand New Archive Pages
 *
 * Description:
 * This script is specifically written to run on the Brand New archives page for new branding and identity projects.
 * URL: https://www.underconsideration.com/brandnew/archives/category/type/new
 *
 * Usage:
 * The script is designed to be used with the Tampermonkey extension for browsers.
 * When executed via Tampermonkey, it will loop through the pages on the specified URL and extract relevant data from each page.
 *
 * Data Extraction:
 * It extracts the following details from each project listed on the page:
 * - Website URL
 * - Image URL
 * - Project Title
 * - Project Subtitle
 * - Project Type (inferred from the context)
 * - Action (e.g., Noted, Spotted, Reviewed)
 * - Date of the post
 * - Comment Count
 * - Favorite Count
 *
 * The extracted data is then logged to the console, which can be used for various purposes such as data analysis, archiving, etc.
 *
 * Note:
 * The structure of the extracted data is dependent on the consistent layout of the webpage.
 * Any changes in the website's HTML structure may require adjustments to the script.
 */

(function() {
    'use strict';

    function updateLogosArray() {
        // Retrieve the stored logos array from localStorage, or create a new one if it doesn't exist
        var logosArray = JSON.parse(localStorage.getItem('logos')) || [];
        var itemsAdded = 0; // Counter for the number of items added from this page

        const gridItems = document.querySelectorAll('.grid-item');

        gridItems.forEach(gridItem => {
            const itemData = extractDataFromGridItem(gridItem);
            // Check if the logo data already exists to avoid duplicates
            const isUnique = !logosArray.some(item => item.websiteURL === itemData.websiteURL);

            if (isUnique) {
                logosArray.push(itemData);
                itemsAdded++;
            }
        });

        // Save the updated array back to localStorage
        localStorage.setItem('logos', JSON.stringify(logosArray));

        console.log('Updated logos array:', logosArray);
        console.log('Total items in logos array:', logosArray.length);
        console.log('Items added from this page:', itemsAdded);
    }


    // Function to extract data from each 'grid-item' element
    function extractDataFromGridItem(gridItem) {
        // Extract imageURL either from background-image or img src
        let imageURL = '';
        const backgroundImageStyle = gridItem.querySelector('.lead_image_image')?.style.backgroundImage;
        const imageTagSrc = gridItem.querySelector('.lead_image_image img')?.getAttribute('src');

        if (backgroundImageStyle) {
            imageURL = backgroundImageStyle.slice(5, -2); // Extract from 'url("...")'
        } else if (imageTagSrc) {
            imageURL = imageTagSrc;
        }

        const websiteURL = gridItem.querySelector('a').getAttribute('href');
        const title = gridItem.querySelector('.title h1')?.textContent.trim();

        // Extract and clean subTitle (remove unwanted characters like '\n' and numbers at the end)
        let subTitle = gridItem.querySelector('.title h2')?.textContent.trim() ?? '';
        subTitle = subTitle.replace(/[\n\d]+$/, '').trim(); // Removes newline and trailing numbers

        // Extract project type from the subTitle if possible
        let projectType = 'New';

        // Extract the full text, including action and date
        let fullText = gridItem.querySelector('h5')?.textContent.trim();

        // Extract action, assuming it's the first word
        const action = fullText.split(' ')[0];

        // Remove the action and anything from "Comments" or "No Comments" onwards from the full text to get the date
        let dateText = fullText.replace(action, '').replace(/(No )?Comments.*/, '').trim();

        // Extract comment count
        const commentCount = gridItem.querySelector('h5 a')?.textContent.match(/\d+/)?.[0] ?? 0;

        // Extract favorite count
        const favoriteCount = gridItem.querySelector('.favorites_area_archive span')?.textContent.trim();

        return {
            websiteURL,
            imageURL,
            title,
            subTitle,
            projectType,
            action,
            date: dateText,
            commentCount,
            favoriteCount
        };
    }

    function goToNextPage() {
        // Select the link that specifically contains the text 'Older Posts'
        const olderPostsLink = Array.from(document.querySelectorAll('#pagination a')).find(el => el.textContent === 'Older Posts');

        if (olderPostsLink) {
            olderPostsLink.click(); // Click the link if it exists
            console.log('Navigating to the next page.');
        } else {
            console.log('No more pages to navigate to.');
        }
    }


    function processPage() {
        updateLogosArray();
        goToNextPage();
    }

    setTimeout(function() {
        processPage();
    }, 2000);

})();
