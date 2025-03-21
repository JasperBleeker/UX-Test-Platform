const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');


menuToggle.addEventListener('click', function() {
    this.classList.toggle('active');
    mobileMenu.classList.toggle('open');
});