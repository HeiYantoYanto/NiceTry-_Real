const CACHE_NAME = 'nicetry-app-v1';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './theme.css',
  './app.js',
  './navbar/navbar_main.css',
  './course/courses-mainpage/courses-styles.css',
  './shared/theme.js',
  './shared/sidebar.js',
  './shared/progress.js',
  './shared/progress-home.js',
  './shared/click.js',
  './shared/auth.js',
  './images/Icon.svg',
  './images/clouds.png',
  './images/stars.png',
  './images/twinkling.png',
  './images/wave.png',
  './images/Learning_Page_BG.png',
  // Add game pages
  './games/difficulty.html',
  './games/difficulty.css',
  './games/difficulty.js',
  './games/gamesnew.css',
  './games/gamesnew.js',
  // Add course pages
  './course/course-type/data_structure/',
  './course/course-type/searchalgo/',
  './course/course-type/sortalgo/',
  // Add profile pages
  './profile/profile.html',
  './profile/profile.css',
  './profile/profile.js',
  // Add login pages
  './login_signup/login/login.html',
  './login_signup/signup/signup.html'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});