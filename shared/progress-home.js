document.addEventListener('DOMContentLoaded', function() {
    // Hide/remove legacy progress bar UI in favor of Level widget
    const container = document.getElementById('progress-container');
    if (container) {
        container.style.opacity = 0;
        container.style.display = 'none';
    }
    // No-op showProgressGain to avoid errors if called elsewhere
    window.showProgressGain = function() {};
});