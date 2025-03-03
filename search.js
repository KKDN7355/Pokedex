/*
    ####### ####### ####### ######  ####### #    ##   ######  ####### ######
    ##      #       #    ## #    ## #       #    ##   #    ## #    ## #    ##
    ####### ####### ####### ######  #       #######   ######  ####### ######
        ### #       #    ## #   ##  #       #    ##   #    ## #    ## #   ##
    ####### ####### #    ## #    ## ####### #    ##   ######  #    ## #    ##
*/

const searchInput = document.getElementById("search-input");

// Ensure elements exist before adding event listeners
if (searchInput) {
    searchInput.addEventListener("input", handleInputChange);
} else {
    console.error("Error: search input not found!");
}

// Show "X" button when typing, hide it when empty
function handleInputChange() {
    const closeButton = document.getElementById("search-close-icon"); // Get it dynamically

    if (!closeButton) return;

    if (searchInput.value.trim() !== "") {
        closeButton.classList.remove("hidden"); // Show "X"
    } else {
        closeButton.classList.add("hidden"); // Hide "X"
    }
}