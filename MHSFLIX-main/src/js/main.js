// main.js

const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navMenu.classList.toggle("active");
  document.querySelector(".overlay").classList.toggle("active");
});

const API_KEY = "e950e51d5d49e85f7c2f17f01eb23ba3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

const moviesGrid = document.getElementById("moviesGrid");
const movieModal = document.getElementById("movieModal");
const closeModal = document.getElementById("closeModal");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const filterButtons = document.querySelectorAll(".filter-button");
const noResults = document.getElementById("noResults");

let allMovies = [];
let displayedMovies = [];

function showLoading() {
  moviesGrid.innerHTML = "";
  for (let i = 0; i < 6; i++) {
    const loadingCard = document.createElement("div");
    loadingCard.className = "movie-card shimmer-loading";
    moviesGrid.appendChild(loadingCard);
  }
}

async function loadMovies() {
  showLoading();
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=id-ID&region=ID`
    );
    const data = await res.json();
    allMovies = data.results;
    displayedMovies = [...allMovies];
    renderMovies(displayedMovies);
    setTimeout(() => {
      addCardHoverEffects();
      addScrollAnimations();
    }, 100);
  } catch (e) {
    console.error("Error loading movies:", e);
  }
}

function renderMovies(movies) {
  moviesGrid.innerHTML = "";
  noResults.style.display = movies.length ? "none" : "block";
  movies.forEach((movie) => {
    const card = document.createElement("div");
    card.className = "movie-card";
    card.dataset.id = movie.id;

    const posterUrl = movie.poster_path
      ? IMG_BASE + movie.poster_path
      : "img/placeholder.png";

    card.innerHTML = `
            <img class="movie-poster" src="${posterUrl}" alt="${movie.title}">
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <div class="movie-meta">
                    <div class="movie-rating">
                        <span class="rating-star"><i class="fa-solid fa-star"></i></span>
                        <span>${movie.vote_average.toFixed(1)}</span>
                    </div>
                    <div class="movie-year">${
                      movie.release_date?.slice(0, 4) || ""
                    }</div>
                </div>
            </div>
            <div class="watch-icon"><i class="fa-solid fa-play"></i></div>
        `;
    card.addEventListener("click", () => openMovieDetails(movie.id));
    moviesGrid.appendChild(card);
  });
}

let searchTimeout;
function debounceSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(searchMovies, 300);
}

async function searchMovies() {
  const query = searchInput.value.trim();
  if (!query) {
    displayedMovies = [...allMovies];
  } else {
    showLoading();
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=id-ID&query=${encodeURIComponent(
          query
        )}`
      );
      const data = await res.json();
      displayedMovies = data.results;
    } catch {
      displayedMovies = [];
    }
  }
  renderMovies(displayedMovies);
  setTimeout(() => {
    addCardHoverEffects();
    addScrollAnimations();
  }, 100);
}

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (!btn.classList.contains("active")) {
      document
        .querySelector(".filter-button.active")
        .classList.remove("active");
      btn.classList.add("active");
      searchMovies();
    }
  });
});

async function openMovieDetails(id) {
  try {
    const [movieRes, creditsRes] = await Promise.all([
      fetch(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=id-ID`
      ),
      fetch(
        `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${API_KEY}`
      ),
    ]);
    const movie = await movieRes.json();
    const credits = await creditsRes.json();

    const backdropEl = document.getElementById("modalBackdrop");
    backdropEl.src = movie.backdrop_path ? IMG_BASE + movie.backdrop_path : "";

    document.getElementById("modalTitle").textContent = movie.title;
    document.getElementById(
      "modalYear"
    ).innerHTML = `<i class="fa-regular fa-calendar"></i> ${movie.release_date?.slice(
      0,
      4
    )}`;
    document.getElementById("modalRating").textContent =
      movie.vote_average.toFixed(1);

    const genreContainer = document.getElementById("modalGenres");
    genreContainer.innerHTML = "";
    movie.genres.forEach((genre) => {
      const tag = document.createElement("div");
      tag.className = "genre-tag";
      tag.textContent = genre.name;
      genreContainer.appendChild(tag);
    });

    let synopsis = movie.overview;
    if (!synopsis) {
      const enRes = await fetch(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=en-US`
      );
      const enMovie = await enRes.json();
      synopsis = enMovie.overview || "Synopsis not available.";
    }
    document.getElementById("modalSynopsis").textContent = synopsis;

    const castList = credits.cast
      .slice(0, 5)
      .map((c) => c.name)
      .join(", ");
    document.getElementById("modalCast").textContent = castList || "—";

    const director = credits.crew
      .filter((c) => c.job === "Director")
      .map((d) => d.name)
      .join(", ");
    document.getElementById("modalDirector").textContent = director || "—";

    const writers = credits.crew
      .filter((c) => ["Writer", "Screenplay", "Author"].includes(c.job))
      .map((w) => w.name)
      .join(", ");
    document.getElementById("modalWriter").textContent = writers || "—";

    movieModal.style.display = "block";
    document.body.style.overflow = "hidden";
  } catch (e) {
    console.error("Error loading movie details:", e);
  }
}

closeModal.addEventListener("click", () => {
  movieModal.style.display = "none";
  document.body.style.overflow = "auto";
});

window.addEventListener("click", (e) => {
  if (e.target === movieModal) closeModal.click();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && movieModal.style.display === "block")
    closeModal.click();
});

function addCardHoverEffects() {
  const cards = document.querySelectorAll(".movie-card");
  cards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      cards.forEach((other) => {
        if (other !== card) {
          other.style.opacity = "0.7";
          other.style.transform = "scale(0.98)";
        }
      });
    });
    card.addEventListener("mouseleave", () => {
      cards.forEach((other) => {
        other.style.opacity = "1";
        other.style.transform = "";
      });
    });
  });
}

function addScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("fade-in");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  document
    .querySelectorAll(".movie-card")
    .forEach((card) => observer.observe(card));
}

searchButton.addEventListener("click", searchMovies);
searchInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") searchMovies();
  else debounceSearch();
});

loadMovies();
