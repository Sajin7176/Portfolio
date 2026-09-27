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

    const contactFields = document.querySelectorAll("#contactForm .input-group input, #contactForm .input-group textarea");
    const catPrompts = {
        name: "Who are you?",
        email: "A secret address?",
        subject: "What's the story?",
        message: "Tell me everything!"
    };
    const typingThoughts = ["Ooh, a start...", "Interesting...", "Keep going..."];

    contactFields.forEach(field => {
        const fieldGroup = field.closest(".input-group");
        const catThought = fieldGroup.querySelector(".cat-thought");

        field.addEventListener("focus", () => {
            fieldGroup.classList.add("is-curious");
            catThought.textContent = field.value.trim() ? "Back for more?" : catPrompts[field.name];
        });

        field.addEventListener("input", () => {
            const length = field.value.trim().length;
            fieldGroup.classList.toggle("is-typing", length > 0);
            catThought.textContent = length > 0 ?
                typingThoughts[Math.min(Math.floor(length / 18), typingThoughts.length - 1)] :
                catPrompts[field.name];
        });

        field.addEventListener("blur", () => {
            fieldGroup.classList.remove("is-curious", "is-typing");
            catThought.textContent = catPrompts[field.name];
        });
    });

    document.querySelectorAll(".social-orb").forEach(socialOrb => {
        const socialPopout = socialOrb.querySelector(".social-popout");
        let pointerInside = false;
        let buttonFocused = false;

        function setSocialPopoutOpen(isOpen) {
            socialOrb.classList.toggle("is-open", isOpen);
            if (isOpen) {
                socialPopout.style.opacity = "1";
                socialPopout.style.visibility = "visible";
            } else {
                socialPopout.style.removeProperty("opacity");
                socialPopout.style.removeProperty("visibility");
            }
        }

        function updateSocialPopout() {
            setSocialPopoutOpen(pointerInside || buttonFocused);
        }

        socialOrb.addEventListener("pointerenter", () => {
            pointerInside = true;
            updateSocialPopout();
        });
        socialOrb.addEventListener("pointerleave", () => {
            pointerInside = false;
            updateSocialPopout();
        });
        socialOrb.addEventListener("focus", () => {
            buttonFocused = true;
            updateSocialPopout();
        });
        socialOrb.addEventListener("blur", () => {
            buttonFocused = false;
            updateSocialPopout();
        });
    });

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
                navLinks.classList.remove('mobile-open');
            }
        });
    });

    const pointerCompass = document.getElementById("pointerCompass");
    const supportsPointerCompass = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches;

    if (pointerCompass && supportsPointerCompass) {
        document.addEventListener("pointermove", event => {
            pointerCompass.style.setProperty("--pointer-x", `${event.clientX}px`);
            pointerCompass.style.setProperty("--pointer-y", `${event.clientY}px`);
            pointerCompass.classList.add("is-visible");
        });

        document.addEventListener("pointerleave", () => {
            pointerCompass.classList.remove("is-visible");
        });

        window.addEventListener("blur", () => {
            pointerCompass.classList.remove("is-visible");
        });
    }

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

    /* -------- NAVBAR SCROLL EFFECT + SCROLL PROGRESS + BACK TO TOP -------- */
    const header = document.getElementById("siteHeader");
    const scrollProgress = document.getElementById("scrollProgress");
    const backToTop = document.getElementById("backToTop");

    function onScroll() {
        if (window.scrollY > 60) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }

        if (scrollProgress) {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            scrollProgress.style.width = pct + "%";
        }

        if (backToTop) {
            if (window.scrollY > 500) {
                backToTop.classList.add("show");
            } else {
                backToTop.classList.remove("show");
            }
        }
    }

    window.addEventListener("scroll", onScroll);
    onScroll();

    if (backToTop) {
        backToTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    /* -------- CERTIFICATION CAROUSEL -------- */
    const wrapper = document.querySelector(".carousel-wrapper");
    const slides = document.querySelectorAll(".carousel-slide");
    const prev = document.getElementById("prev");
    const next = document.getElementById("next");
    const dotsContainer = document.getElementById("certDots");

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

});

/* -------- CLOSE POPUP FUNCTION -------- */
function closePopup() {
    if (popup) {
        popup.classList.remove("show");
    }
}