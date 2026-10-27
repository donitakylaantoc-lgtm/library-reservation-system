/*
  CARIGARA PUBLIC LIBRARY
  MEMBER 1: Donita Kyla Antoc

  Responsibilities:
  - Initialize the website
  - Handle search interactions
  - Handle category filter buttons
  - Load the catalog and reservations
*/

window.showToast = function (message) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");

    window.clearTimeout(window.toastTimer);

    window.toastTimer = window.setTimeout(function () {
        toast.classList.remove("show");
    }, 2600);
};


document.addEventListener("DOMContentLoaded", function () {

    const searchButton =
        document.getElementById("searchButton");

    const searchInput =
        document.getElementById("searchInput");

    const clearSearch =
        document.getElementById("clearSearch");

    const categoryFilters =
        document.getElementById("categoryFilters");

    searchButton.addEventListener("click", function () {
        window.renderCatalog();
    });

    searchInput.addEventListener("input", function () {
        window.renderCatalog();
    });


    searchInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            window.renderCatalog();
        }
    });


    clearSearch.addEventListener("click", function () {
        searchInput.value = "";

        window.renderCatalog();

        searchInput.focus();
    });


    categoryFilters.addEventListener("click", function (event) {

        const button = event.target.closest("[data-category]");

        if (!button) {
            return;
        }

        document.querySelectorAll(".filter-chip").forEach(
            function (chip) {
                chip.classList.toggle(
                    "active",
                    chip === button
                );
            }
        );

        window.renderCatalog();
    });


    window.releaseExpiredReservations();


    window.renderCatalog();

    window.renderReservations();

});