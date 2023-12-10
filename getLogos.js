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


// Function to extract data from each 'grid-item' element
function extractDataFromGridItem(gridItem) {
    const websiteURL = gridItem.querySelector('a').getAttribute('href');
    const imageURL = gridItem.querySelector('.lead_image_image').style.backgroundImage.slice(5, -2); // removes 'url("...")' wrapper
    const title = gridItem.querySelector('.title h1')?.textContent.trim();

    // Extract and clean subTitle (remove unwanted characters like '\n' and numbers at the end)
    let subTitle = gridItem.querySelector('.title h2')?.textContent.trim();
    subTitle = subTitle.replace(/[\n\d]+$/, '').trim(); // Removes newline and trailing numbers

    // Extract project type from the subTitle if possible
    let projectType = '';
    if (subTitle.includes('New')) {
        projectType = 'New';
    } else if (subTitle.includes('Spotted')) {
        projectType = 'Spotted';
    } else if (subTitle.includes('Reviewed')) {
        projectType = 'Reviewed';
    } // Add more conditions if there are other types

    // Extract date and remove the 'Comments' part
    let dateText = gridItem.querySelector('h5')?.textContent.trim();
    const action = dateText.split(' ')[0]; // Assuming the first word is the action
    dateText = dateText.replace(/Comments.*/, '').trim(); // Removes 'Comments' and anything after it

    // Extract comment count
    const commentCount = gridItem.querySelector('h5 a')?.textContent.match(/\d+/)[0];

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

// Function to loop through all 'grid-item' elements and extract data
function extractDataFromPage() {
    const gridItems = document.querySelectorAll('.grid-item');
    const data = [];

    gridItems.forEach(gridItem => {
        const itemData = extractDataFromGridItem(gridItem);
        data.push(itemData);
    });

    return data;
}

// Example usage
const extractedData = extractDataFromPage();
console.log(extractedData);
