/* ================= PAGE LOADED ================= */

// Global variables for form and popup - initialize to null
var form = null;
var popup = null;

document.addEventListener('DOMContentLoaded', function() {

    /* -------- GET FORM AND POPUP ELEMENTS -------- */
    form = document.getElementById("contactForm");
    popup = document.getElementById("contactPopup");

    console.log("Form element:", form);
    console.log("Popup element:", popup);

    /* -------- MOBILE NAV -------- */
    const navToggle = document.getElementById("navToggle");
    const navLinks = document.querySelector(".nav-links");

    navToggle.addEventListener("click", () => {
        navLinks.classList.toggle("mobile-open");
    });

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
    const revealElements = document.querySelectorAll('.reveal, .skill-card');
    revealElements.forEach(el => {
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

    /* -------- CONTACT FORM & POPUP -------- */
    // Use the global form and popup variables already declared above
    if (form) {
        form.addEventListener("submit", async function(e) {
            e.preventDefault();
            console.log("Form submitted");

            const formData = new FormData(form);

            try {
                const response = await fetch("https://formspree.io/f/xpqjdyao", {
                    method: "POST",
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                // Show popup regardless of response
                console.log("Showing popup now");
                popup.classList.add("show");
                form.reset();
            } catch (error) {
                console.log("Error caught, showing popup anyway");
                popup.classList.add("show");
                form.reset();
            }
        });
    }

    /* -------- NAVBAR SCROLL EFFECT -------- */
    const header = document.getElementById("siteHeader");

    window.addEventListener("scroll", () => {
        if (window.scrollY > 60) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });

    /* -------- CERTIFICATION CAROUSEL -------- */
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

});

/* -------- CLOSE POPUP FUNCTION -------- */
function closePopup() {
    if (popup) {
        popup.classList.remove("show");
    }
}