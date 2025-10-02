    const menu = document.querySelector('#mobile-menu')
const menuLinks = document.querySelector('.navbar__menu')

menu.addEventListener('click', function() {
    menu.classList.toggle('is-active')
    menuLinks.classList.toggle('active')
})

document.getElementById('scroll-arrow').addEventListener('click', function(e) {
e.preventDefault();
document.getElementById('next-section').scrollIntoView({ behavior: 'smooth' });
});

const arrow = document.getElementById('scroll-arrow');
const navbar = document.querySelector('.navbar');

arrow.addEventListener('click', function(e) {
    e.preventDefault();
    if (window.scrollY < window.innerHeight / 2) {
        document.getElementById('courses-section').scrollIntoView({ behavior: 'smooth' });
        arrow.classList.add('rotate');
        navbar.classList.add('flip');
        arrow.classList.add('arrow-colored');
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        arrow.classList.remove('rotate');
        navbar.classList.remove('flip');
        arrow.classList.remove('arrow-colored');
    }
});


window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY >= window.innerHeight / 2) {
        navbar.classList.add('hide');
    } else {
        navbar.classList.remove('hide');
    }
});

const nextFadein = document.querySelector('.next__fadein');
const nextSection = document.getElementById('courses-section');

function handleScroll() {
    const rect = nextSection.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
        nextFadein.classList.add('animate');
    } else {
        nextFadein.classList.remove('animate');
    }
}

window.addEventListener('scroll', handleScroll);
window.addEventListener('load', handleScroll);

function scrollToCoursesSection(e) {
    e.preventDefault();
    const section = document.getElementById('courses-section');
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Sidebar functionality
function showSidebar() {
    const sidebar = document.getElementById('user-sidebar');
    if (!sidebar) return;
    
    // Update username if available
    const currentUser = sessionStorage.getItem('currentUser');
    const usernameElement = document.getElementById('sidebar-username');
    if (usernameElement && currentUser) {
        usernameElement.textContent = currentUser;
    }
    
    sidebar.classList.add('show');
    document.body.classList.add('sidebar-open');
    
    // Add event listeners
    const closeBtn = document.getElementById('close-sidebar');
    const settingsBtn = document.getElementById('settings-btn');
    const achievementsBtn = document.getElementById('achievements-btn');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', hideSidebar);
    }
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function() {
            hideSidebar();
            // Link will handle navigation automatically
        });
    }
    
    if (achievementsBtn) {
        achievementsBtn.addEventListener('click', function() {
            hideSidebar();
            // Link will handle navigation automatically
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            hideSidebar();
            // Trigger logout from auth.js
            if (window.handleLogout) {
                window.handleLogout();
            }
        });
    }
    
    // Close sidebar when clicking outside
    setTimeout(() => {
        document.addEventListener('click', closeSidebarOnClickOutside);
    }, 100);
}

// Make showSidebar globally accessible
window.showSidebar = showSidebar;

function hideSidebar() {
    const sidebar = document.getElementById('user-sidebar');
    if (sidebar) {
        sidebar.classList.remove('show');
        document.body.classList.remove('sidebar-open');
    }
    document.removeEventListener('click', closeSidebarOnClickOutside);
}

function closeSidebarOnClickOutside(event) {
    const sidebar = document.getElementById('user-sidebar');
    const profileIcon = document.querySelector('.fa-circle-user');
    
    if (sidebar && !sidebar.contains(event.target) && !profileIcon.contains(event.target)) {
        hideSidebar();
    }
}

// Home page only: handle "Course" navbar link and "Start Learning" button

document.addEventListener('DOMContentLoaded', function() {
    const courseNavLink = document.getElementById('course-navbar-link');
    const learnBtn = document.getElementById('learn__btn');
    const downArrow = document.getElementById('scroll-arrow');

    if (courseNavLink) {
        courseNavLink.addEventListener('click', scrollToCoursesSection);
    }
    if (learnBtn) {
        learnBtn.addEventListener('click', scrollToCoursesSection);
    }
    if (downArrow) {
        downArrow.addEventListener('click', scrollToCoursesSection);
    }

    // Diagnostic Test Popup Logic
    // Only show for first login (per user)
    function getCurrentUserEmail() {
        const loggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        const email = sessionStorage.getItem('currentUser');
        return loggedIn && email ? email : null;
    }

    function hasTakenDiagnostic(email) {
        return localStorage.getItem('diagnostic_done_' + email) === 'true';
    }
    function setDiagnosticDone(email) {
        localStorage.setItem('diagnostic_done_' + email, 'true');
    }

    // Listen for login event
    window.addEventListener('auth:login', function() {
        const email = getCurrentUserEmail();
        if (!email || hasTakenDiagnostic(email)) return;
        setTimeout(() => {
            showDiagnosticModal(email);
        }, 2000);
    });

    // If already logged in on load, check immediately
    const email = getCurrentUserEmail();
    if (email && !hasTakenDiagnostic(email)) {
        setTimeout(() => {
            showDiagnosticModal(email);
        }, 2000);
    }

    // Diagnostic Quiz Data (10 MCQs)
    const diagnosticQuestions = [
        {
            q: "What is the time complexity of binary search?",
            options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
            answer: 1
        },
        {
            q: "Which data structure uses FIFO order?",
            options: ["Stack", "Queue", "Tree", "Graph"],
            answer: 1
        },
        {
            q: "Which sorting algorithm is NOT comparison-based?",
            options: ["Merge Sort", "Quick Sort", "Counting Sort", "Heap Sort"],
            answer: 2
        },
        {
            q: "What does HTML stand for?",
            options: ["Hyper Trainer Marking Language", "Hyper Text Markup Language", "Hyper Text Marketing Language", "Hyper Tool Markup Language"],
            answer: 1
        },
        {
            q: "Which is a searching algorithm?",
            options: ["Bubble Sort", "Linear Search", "Selection Sort", "Insertion Sort"],
            answer: 1
        },
        {
            q: "Which keyword declares a variable in JavaScript?",
            options: ["var", "int", "float", "define"],
            answer: 0
        },
        {
            q: "Which is NOT a primitive data type in JS?",
            options: ["String", "Number", "Array", "Boolean"],
            answer: 2
        },
        {
            q: "Which algorithm is best for nearly sorted arrays?",
            options: ["Bubble Sort", "Insertion Sort", "Selection Sort", "Heap Sort"],
            answer: 1
        },
        {
            q: "Which is used to style web pages?",
            options: ["HTML", "CSS", "Python", "SQL"],
            answer: 1
        },
        {
            q: "What does CSS stand for?",
            options: ["Cascading Style Sheets", "Colorful Style Syntax", "Computer Style Sheets", "Creative Style System"],
            answer: 0
        }
    ];

    function showDiagnosticModal(email) {
        const overlay = document.getElementById('diagnostic-modal-overlay');
        const modal = document.getElementById('diagnostic-modal');
        const questionsDiv = document.getElementById('diagnostic-questions');
        const form = document.getElementById('diagnostic-quiz-form');
        const resultDiv = document.getElementById('diagnostic-result');
        if (!overlay || !modal || !questionsDiv || !form) return;

        // Build questions
        questionsDiv.innerHTML = '';
        diagnosticQuestions.forEach((q, i) => {
            const qDiv = document.createElement('div');
            qDiv.className = 'diagnostic-question';
            const qTitle = document.createElement('p');
            qTitle.textContent = (i+1) + '. ' + q.q;
            qDiv.appendChild(qTitle);
            q.options.forEach((opt, j) => {
                const label = document.createElement('label');
                label.style.display = 'block';
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = 'q' + i;
                radio.value = j;
                label.appendChild(radio);
                label.appendChild(document.createTextNode(' ' + opt));
                qDiv.appendChild(label);
            });
            questionsDiv.appendChild(qDiv);
        });
        resultDiv.style.display = 'none';
        form.style.display = '';
        overlay.style.display = 'flex';

        // Prevent background scroll
        document.body.style.overflow = 'hidden';

        form.onsubmit = function(e) {
            e.preventDefault();
            let score = 0;
            let correct = 0;
            for (let i = 0; i < diagnosticQuestions.length; i++) {
                const radios = form.elements['q'+i];
                let selected = -1;
                if (radios) {
                    if (radios.length) {
                        for (let r of radios) if (r.checked) selected = parseInt(r.value);
                    } else if (radios.checked) {
                        selected = parseInt(radios.value);
                    }
                }
                if (selected === diagnosticQuestions[i].answer) {
                    score += 75;
                    correct++;
                }
            }
            setDiagnosticDone(email);
            form.style.display = 'none';
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `<h3>Your Score: ${score} / 750</h3><p>You got <b>${correct}</b> out of ${diagnosticQuestions.length} correct.</p><p>Thank you for completing the diagnostic test!</p><button id="diagnostic-close-btn">Close</button>`;
            // Award XP to Achievements system if available
            if (window.Achievements && typeof window.Achievements.awardXP === 'function') {
                window.Achievements.awardXP(score, 'diagnostic-test');
            }
            document.getElementById('diagnostic-close-btn').onclick = function() {
                overlay.style.display = 'none';
                document.body.style.overflow = '';
            };
        };
    }
});
