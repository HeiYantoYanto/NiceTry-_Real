// Additional sidebar functionality for settings page
        document.addEventListener('DOMContentLoaded', function() {
            const settingsBtn = document.getElementById('settings-btn');
            const achievementsBtn = document.getElementById('achievements-btn');
            
            if (settingsBtn) {
                settingsBtn.addEventListener('click', function() {
                    // Already on settings page, just close sidebar
                    if (window.hideSidebar) {
                        window.hideSidebar();
                    }
                });
            }
            
            if (achievementsBtn) {
                achievementsBtn.addEventListener('click', function() {
                    window.location.href = 'achivements.html';
                });
            }
        });
        
        // Settings functionality
        function saveSettings() {
            const settings = {
                theme: document.getElementById('theme').value,
                animations: document.getElementById('animations').checked,
                fontSize: document.getElementById('font-size').value,
                progressTracking: document.getElementById('progress-tracking').checked,
                autoSave: document.getElementById('auto-save').checked,
                difficulty: document.getElementById('difficulty').value,
                emailNotifications: document.getElementById('email-notifications').checked,
                achievementAlerts: document.getElementById('achievement-alerts').checked,
                reminderFrequency: document.getElementById('reminder-frequency').value,
                profileVisibility: document.getElementById('profile-visibility').checked,
                dataSharing: document.getElementById('data-sharing').checked
            };

            localStorage.setItem('userSettings', JSON.stringify(settings));
            alert('Settings saved successfully!');
        }

        function resetSettings() {
            if (confirm('Are you sure you want to reset all settings to default?')) {
                localStorage.removeItem('userSettings');
                location.reload();
            }
        }

        function loadSettings() {
            const savedSettings = localStorage.getItem('userSettings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                
                document.getElementById('theme').value = settings.theme || 'dark';
                document.getElementById('animations').checked = settings.animations !== false;
                document.getElementById('font-size').value = settings.fontSize || 'medium';
                document.getElementById('progress-tracking').checked = settings.progressTracking !== false;
                document.getElementById('auto-save').checked = settings.autoSave !== false;
                document.getElementById('difficulty').value = settings.difficulty || 'intermediate';
                document.getElementById('email-notifications').checked = settings.emailNotifications || false;
                document.getElementById('achievement-alerts').checked = settings.achievementAlerts !== false;
                document.getElementById('reminder-frequency').value = settings.reminderFrequency || 'weekly';
                document.getElementById('profile-visibility').checked = settings.profileVisibility || false;
                document.getElementById('data-sharing').checked = settings.dataSharing !== false;
            }
        }

        // Load settings on page load
        document.addEventListener('DOMContentLoaded', loadSettings);