const menu = document.querySelector('#mobile-menu')
    const menuLinks = document.querySelector('.navbar__menu')

    menu.addEventListener('click', function() {
        menu.classList.toggle('is-active')
        menuLinks.classList.toggle('active')
    })

    window.addEventListener('DOMContentLoaded', function() {
    const img = document.querySelector('.signup__image img');
    function swapImage() {
        if (!img) return;
        if (window.innerWidth <= 960) {
            img.src = "./images/login-img.svg";
        } else {
            img.src = './images/undraw_focused_m9bj.svg';
        }
    }
    swapImage();
    window.addEventListener('resize', swapImage);
});

document.getElementById('signup__form').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('username').value;
    const password = document.getElementById('email').value;

    // Get stored user accounts from localStorage
    const userAccounts = JSON.parse(localStorage.getItem('userAccounts') || '{}');

    console.log('Entered email:', email);
    console.log('Entered password:', password);
    console.log('Stored accounts:', userAccounts);

    if (userAccounts[email] && userAccounts[email].password === password) {
        // Set session flag
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('currentUser', email);
        // Mark admin session flag
        try {
            const isAdmin = (userAccounts[email].role === 'admin') || (email === 'admin@gmail.com');
            sessionStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
        } catch (_) {}
        
        // Initialize progress if not exists
        if (!localStorage.getItem('progress_' + email)) {
            localStorage.setItem('progress_' + email, '0');
        }
        
        alert('Login successful!');

    try { window.dispatchEvent(new CustomEvent('auth:login', { detail: { email } })); } catch (e) {}
    try { localStorage.setItem('auth:signal', JSON.stringify({ type: 'login', email, ts: Date.now() })); } catch (e) {}
        
        // Update navbar state if function is available
        if (window.updateNavbarState) {
            window.updateNavbarState();
        }
        
        // Redirect to home page
        window.location.href = '../../index.html';
    } else {
        alert('Invalid email or password.');
    }
});

// Redirect if already logged in
window.addEventListener('DOMContentLoaded', function() {
    if (sessionStorage.getItem('isLoggedIn') === 'true' && sessionStorage.getItem('currentUser')) {
        window.location.href = '../../index.html';
    }
});