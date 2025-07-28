/**
 * Script loader utility to safely load page-specific scripts
 * and prevent errors from scripts trying to access elements
 * that don't exist on the current page.
 */

// Detect current page
const currentPage = window.location.pathname.split('/').pop() || 'index.html';

// Define which scripts should run on which pages
const scriptMapping = {
    'logout.html': ['logout.js'],
    'login.html': ['login.js'],
    'signup.html': ['signup.js'],
    'index.html': ['script.js'],
    // Add more page mappings as needed
};

// Helper for safely handling DOM elements
window.safeGetElement = function(selector) {
    return document.querySelector(selector);
};

window.safeAddEventListener = function(selector, event, handler) {
    const element = document.querySelector(selector);
    if (element) {
        element.addEventListener(event, handler);
        return true;
    }
    return false;
};

// Log the page initialization for debugging
console.log(`Initializing page: ${currentPage}`);
