
const FAVORITES_KEY = "carigaraLibraryFavorites";

function getFavoriteBooks() {
    try {
        const saved = localStorage.getItem(FAVORITES_KEY);
        const favorites = saved ? JSON.parse(saved) : [];

        return Array.isArray(favorites) ? favorites : [];
    } catch (error) {
        return [];
    }
}

function saveFavoriteBooks(favorites) {
    localStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(favorites)
    );
}

window.renderCatalog = function () {
    const bookGrid = document.getElementById("bookGrid");
    const searchInput = document.getElementById("searchInput");
    const resultCount = document.getElementById("resultCount");
    const emptyState = document.getElementById("emptyState");

    if (!bookGrid || !searchInput) {
        return;
    }

    const searchText = searchInput.value
        .trim()
        .toLowerCase();

    const activeFilter = document.querySelector(
        ".filter-chip.active"
    );

    const selectedCategory = activeFilter
        ? activeFilter.dataset.category
        : "All";

    const favorites = getFavoriteBooks();

    const filteredBooks = window.libraryBooks.filter(
        function (book) {
            const matchesSearch =
                book.title.toLowerCase().includes(searchText) ||
                book.author.toLowerCase().includes(searchText) ||
                book.category.toLowerCase().includes(searchText);

            const matchesCategory =
                selectedCategory === "All" ||
                book.category === selectedCategory;

            return matchesSearch && matchesCategory;
        }
    );

    resultCount.textContent =
        filteredBooks.length + " books found";

    emptyState.classList.toggle(
        "hidden",
        filteredBooks.length !== 0
    );

    bookGrid.innerHTML = filteredBooks.map(
        function (book) {
            const isFavorite = favorites.includes(book.id);

            const statusClass = book.status.toLowerCase();

            const canReserve = book.status === "Available";

            return `
                <article class="book-card">
                    <div
                        class="book-cover"
                        style="
                            --cover: ${book.coverColor};
                            --cover-ink: ${book.coverInk};
                        "
                    >
                        <span class="cover-title">
                            ${book.title}
                        </span>

                        <span class="cover-author">
                            ${book.author}
                        </span>

                        <button
                            class="favorite-button ${isFavorite ? "is-favorite" : ""}"
                            data-favorite="${book.id}"
                            type="button"
                            aria-label="${isFavorite ? "Remove from" : "Add to"} favorites"
                            aria-pressed="${isFavorite}"
                        >
                            ${isFavorite ? "[♥](https://static.xx.fbcdn.net/images/emoji.php/v9/tac/1/16/2665.png)" : "♡"}
                        </button>
                    </div>

                    <div class="book-info">
                        <span class="book-category">
                            ${book.category}
                        </span>

                        <h3>${book.title}</h3>

                        <p class="book-author">
                            By ${book.author}
                        </p>

                        <div class="book-meta">
                            <span class="status ${statusClass}">
                                ${book.status}
                            </span>

                            <button
                                class="reserve-button"
                                data-reserve="${book.id}"
                                type="button"
                                ${canReserve ? "" : "disabled"}
                            >
                                ${canReserve ? "Reserve Book" : book.status}
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }
    ).join("");
};

document.addEventListener("click", function (event) {
    const favoriteButton = event.target.closest(
        "[data-favorite]"
    );

    if (favoriteButton) {
        const bookId = Number(
            favoriteButton.dataset.favorite
        );

        const favorites = getFavoriteBooks();

        const alreadyFavorite = favorites.includes(bookId);

        const updatedFavorites = alreadyFavorite
            ? favorites.filter(function (id) {
                return id !== bookId;
            })
            : [...favorites, bookId];

        saveFavoriteBooks(updatedFavorites);

        window.renderCatalog();

        if (window.showToast) {
            window.showToast(
                alreadyFavorite
                    ? "Removed from favorites."
                    : "Added to favorites!"
            );
        }

        return;
    }

    const reserveButton = event.target.closest(
        "[data-reserve]"
    );

    if (reserveButton && !reserveButton.disabled) {
        const bookId = Number(
            reserveButton.dataset.reserve
        );

        if (typeof window.reserveBook === "function") {
            window.reserveBook(bookId);
        } else if (window.showToast) {
            window.showToast(
                "Reservation feature is being connected."
            );
        }
    }
});
