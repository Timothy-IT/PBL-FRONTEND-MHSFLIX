const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");
const overlay = document.querySelector(".overlay");

hamburger.onclick = function () {
  hamburger.classList.toggle("active");
  navMenu.classList.toggle("active");
  overlay.classList.toggle("active");
};

// Carousel variables
const API_KEY = "e950e51d5d49e85f7c2f17f01eb23ba3";
const IMG_BASE = "https://image.tmdb.org/t/p/original";
const sliderList = document.getElementById("sliderList");
const thumbnailList = document.getElementById("thumbnailList");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");

let slides = [];
let thumbs = [];
let current = 0;
let timer;

// Get popular movies and show carousel
function getMovies() {
  fetch(
    `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=id-ID&page=1`
  )
    .then((res) => res.json())
    .then((data) => {
      let movies = data.results.slice(0, 6);
      showCarousel(movies);
      startAuto();
    })
    .catch((err) => console.log("Gagal ambil data:", err));
}

function showCarousel(movies) {
  sliderList.innerHTML = "";
  thumbnailList.innerHTML = "";
  slides = [];
  thumbs = [];

  movies.forEach((movie, i) => {
    let slide = document.createElement("div");
    slide.className = "item" + (i === 0 ? " active" : "");
    slide.innerHTML = `<img src="${IMG_BASE + movie.backdrop_path}" alt="${
      movie.title
    }">`;
    sliderList.appendChild(slide);
    slides.push(slide);

    let thumb = document.createElement("div");
    thumb.className = "item" + (i === 0 ? " active" : "");
    thumb.innerHTML = `<img src="${IMG_BASE + movie.poster_path}" alt="${
      movie.title
    }">`;
    thumb.onclick = () => showSlide(i);
    thumbnailList.appendChild(thumb);
    thumbs.push(thumb);
  });

  prevBtn.onclick = () => showSlide(current - 1);
  nextBtn.onclick = () => showSlide(current + 1);
}

function showSlide(i) {
  clearInterval(timer);
  startAuto();

  if (i < 0) i = slides.length - 1;
  if (i >= slides.length) i = 0;
  current = i;

  slides.forEach((s, idx) => s.classList.toggle("active", idx === current));
  thumbs.forEach((t, idx) => t.classList.toggle("active", idx === current));
}

function startAuto() {
  timer = setInterval(() => showSlide(current + 1), 5000);
}

getMovies();
