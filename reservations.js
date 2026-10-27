
const RESERVATION_KEY = "carigaraLibraryReservations";
const PICKUP_HOURS = 24;

function getReservations() {
  try {
    return JSON.parse(localStorage.getItem(RESERVATION_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function saveReservations(reservations) {
  localStorage.setItem(
    RESERVATION_KEY,
    JSON.stringify(reservations)
  );
}

function findBook(bookId) {
  return (window.libraryBooks || []).find(function (book) {
    return String(book.id) === String(bookId);
  });
}

function formatDeadline(timestamp) {
  return new Date(timestamp).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function showMessage(message) {
  if (typeof window.showToast === "function") {
    window.showToast(message);
  } else {
    alert(message);
  }
}

window.reserveBook = function (bookId) {
  const book = findBook(bookId);

  if (!book) {
    showMessage("Book not found.");
    return;
  }

  if (book.status !== "Available") {
    showMessage("Sorry, this book is not available.");
    return;
  }

  const reservations = getReservations();

  const alreadyReserved = reservations.some(function (reservation) {
    return String(reservation.bookId) === String(bookId);
  });

  if (alreadyReserved) {
    showMessage("You already reserved this book.");
    return;
  }

  const now = Date.now();

  reservations.push({
    id: String(bookId) + "-" + now,
    bookId: book.id,
    reservedAt: now,
    pickupDeadline: now + PICKUP_HOURS * 60 * 60 * 1000
  });

  saveReservations(reservations);
  book.status = "Reserved";

  window.renderCatalog();
  window.renderReservations();

  showMessage("Book reserved successfully!");
};

window.cancelReservation = function (reservationId) {
  const reservations = getReservations();

  const reservation = reservations.find(function (item) {
    return item.id === reservationId;
  });

  if (!reservation) {
    showMessage("Reservation not found.");
    return;
  }

  const updatedReservations = reservations.filter(function (item) {
    return item.id !== reservationId;
  });

  saveReservations(updatedReservations);

  const book = findBook(reservation.bookId);

  if (book && book.status === "Reserved") {
    book.status = "Available";
  }

  window.renderCatalog();
  window.renderReservations();

  showMessage("Reservation cancelled.");
};

window.releaseExpiredReservations = function () {
  const now = Date.now();
  const reservations = getReservations();
  const activeReservations = [];

  reservations.forEach(function (reservation) {
    if (reservation.pickupDeadline > now) {
      activeReservations.push(reservation);
      return;
    }

    const book = findBook(reservation.bookId);

    if (book && book.status === "Reserved") {
      book.status = "Available";
    }
  });

  saveReservations(activeReservations);
};

window.renderReservations = function () {
  const reservationList = document.getElementById("reservationList");
  const reservationCount = document.getElementById("reservationCount");
  const noReservations = document.getElementById("noReservations");

  if (!reservationList || !reservationCount || !noReservations) {
    return;
  }

  const reservations = getReservations();

  reservationCount.textContent = reservations.length;
  reservationList.innerHTML = "";

  noReservations.classList.toggle(
    "hidden",
    reservations.length > 0
  );

  reservations.forEach(function (reservation) {
    const book = findBook(reservation.bookId);

    if (!book) {
      return;
    }

    const item = document.createElement("article");
    item.className = "reservation-item";

    const details = document.createElement("div");
    details.className = "reservation-details";

    const title = document.createElement("h3");
    title.textContent = book.title;

    const author = document.createElement("p");
    author.textContent = "By " + book.author;

    const deadline = document.createElement("p");
    deadline.textContent =
      "Pickup deadline: " + formatDeadline(reservation.pickupDeadline);

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className = "cancel-reservation";
    cancelButton.textContent = "Cancel Reservation";

    cancelButton.addEventListener("click", function () {
      window.cancelReservation(reservation.id);
    });

    details.appendChild(title);
    details.appendChild(author);
    details.appendChild(deadline);

    item.appendChild(details);
    item.appendChild(cancelButton);

    reservationList.appendChild(item);
  });
};
