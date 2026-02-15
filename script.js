/* ================= PAGE LOADED ================= */

document.addEventListener('DOMContentLoaded', function () {

    /* -------- MOBILE NAV -------- */
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.background = 'white';
            navLinks.style.padding = '1rem';
            navLinks.style.position = 'absolute';
            navLinks.style.right = '1.5rem';
            navLinks.style.top = '60px';
            navLinks.style.boxShadow = '0 10px 30px rgba(11,61,145,0.08)';
        });
    }

    /* -------- CLOSE MOBILE NAV WHEN CLICK -------- */
    document.querySelectorAll('.nav-links a').forEach(a => {
        a.addEventListener('click', () => {
            if (window.innerWidth < 800 && navLinks) {
                navLinks.style.display = 'none';
            }
        });
    });

    /* -------- SCROLL REVEAL ANIMATION -------- */

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    }, {
        threshold: 0.25
    });

    /* About Section */
    document.querySelectorAll('.section-title, .about .lead').forEach(el => {
        observer.observe(el);
    });

    /* Hero Section */
    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });

    /* Add simple tilt effect to skill cards */
    const cards = document.querySelectorAll('.skill-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

});
/* -------- NAVBAR SCROLL EFFECT -------- */

const header = document.getElementById("siteHeader");

window.addEventListener("scroll", () => {
    if (window.scrollY > 60) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
});

/* --------certificate -------- */



const wrapper = document.querySelector(".carousel-wrapper");
const carousel = document.querySelector(".carousel");
const slides = document.querySelectorAll(".carousel-slide");
const prev = document.getElementById("prev");
const next = document.getElementById("next");
const dotsContainer = document.getElementById("certDots");
const glow = document.querySelector(".bg-circle");

let index = 0;

/* create dots */
slides.forEach((slide, i) => {
    const dot = document.createElement("div");
    dot.classList.add("cert-dot");
    if (i === 0) dot.classList.add("active");

    dot.onclick = () => {
        goToSlide(i);
    }
    dotsContainer.appendChild(dot);
});

/* go to slide */

function goToSlide(i) {
    index = i;
    const slide = slides[i];
    wrapper.scrollTo({
        left: slide.offsetLeft - 30,
        behavior: "smooth"
    });

    document.querySelectorAll(".cert-dot").forEach(d => d.classList.remove("active"));
    document.querySelectorAll(".cert-dot")[i].classList.add("active");

    moveGlow(slide);
}

/* glow movement */

function moveGlow(slide) {
    const rect = slide.getBoundingClientRect();
    glow.style.left = (rect.left + rect.width / 2) + "px";
    glow.style.top = (rect.top + rect.height / 2) + "px";
}

/* arrows */

next.onclick = () => {
    index = (index + 1) % slides.length;
    goToSlide(index);
}

prev.onclick = () => {
    index = (index - 1 + slides.length) % slides.length;
    goToSlide(index);
}

/* click card also activates */

slides.forEach((slide, i) => {
    slide.addEventListener("click", () => goToSlide(i));
});

/* initial glow */

moveGlow(slides[0]);

const form = document.querySelector(".contact-form");
const popup = document.getElementById("contactPopup");

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = new FormData(form);

    // send form to Formspree silently
    await fetch(form.action, {
        method: "POST",
        body: data,
        headers: { 'Accept': 'application/json' }
    });

    // show popup
    popup.classList.add("active");

    // clear fields
    form.reset();


});

function closePopup() {
    popup.classList.remove("active");
}