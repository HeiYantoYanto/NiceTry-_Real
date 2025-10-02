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
            img.src = '/login_signup/signup/images/pic2.svg';
        } else {
            img.src = '/login_signup/signup/images/pic1.svg';
        }
    }
    swapImage();
    window.addEventListener('resize', swapImage);
});

document.getElementById('signup__form').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Get existing user accounts or create new object
    const userAccounts = JSON.parse(localStorage.getItem('userAccounts') || '{}');
    
    // Check if email already exists
    if (userAccounts[email]) {
        alert('An account with this email already exists!');
        return;
    }

    // Save new user account
    userAccounts[email] = {
        password: password,
        signupDate: new Date().toISOString()
    };
    localStorage.setItem('userAccounts', JSON.stringify(userAccounts));
    
    // Initialize locked customizations for this user (all locked by default)
    try {
        localStorage.setItem('customizations_' + email, JSON.stringify({
            frame: [],
            textColor: [],
            navbarTheme: [],
            background: [],
            textStyle: [],
            specialEffect: [],
            siteTheme: []
        }));
    } catch (_) {}
    
    // Initialize progress for the new user
    localStorage.setItem('progress_' + email, '0');

    alert('Sign up successful! You can now log in.');
    window.location.href = '../login/login.html'; // Redirect to login page
});