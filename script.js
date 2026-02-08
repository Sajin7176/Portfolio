/* ================= PAGE LOADED ================= */

document.addEventListener('DOMContentLoaded', function() {

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