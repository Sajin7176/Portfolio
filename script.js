// Simple interactivity: mobile nav toggle and contact button smooth scroll
document.addEventListener('DOMContentLoaded', function() {
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

    const contactBtn = document.getElementById('contactBtn');
    if (contactBtn) {
        contactBtn.addEventListener('click', function(e) {
            // default anchor behavior will scroll; close mobile menu if open
            if (window.innerWidth < 800 && navLinks) { navLinks.style.display = 'none'; }
        });
    }

    // Close nav when clicking a link
    document.querySelectorAll('.nav-links a').forEach(a => {
        a.addEventListener('click', () => {
            if (window.innerWidth < 800 && navLinks) { navLinks.style.display = 'none'; }
        });
    });
});