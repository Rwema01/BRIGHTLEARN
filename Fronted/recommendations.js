document.addEventListener('DOMContentLoaded', function() {
    // Initialize recommendation functionality
    initRecommendationFilters();
    setupActionButtons();
    setupRefreshButton();
});

function initRecommendationFilters() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    const sortSelect = document.getElementById('sort-by');
    const recommendationCards = document.querySelectorAll('.recommendation-card');
    
    // Filter by category
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            filterTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            filterRecommendations(category);
        });
    });
    
    // Sort recommendations
    sortSelect.addEventListener('change', function() {
        sortRecommendations(this.value);
    });
    
    function filterRecommendations(category) {
        recommendationCards.forEach(card => {
            if (category === 'all' || card.classList.contains(category)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    function sortRecommendations(sortBy) {
        const container = document.querySelector('.recommendations-grid');
        const cards = Array.from(document.querySelectorAll('.recommendation-card[style="display: block"]'));
        
        cards.sort((a, b) => {
            switch(sortBy) {
                case 'popularity':
                    const aPop = a.getAttribute('data-popularity');
                    const bPop = b.getAttribute('data-popularity');
                    return popularityValue(bPop) - popularityValue(aPop);
                case 'difficulty':
                    const aDiff = a.getAttribute('data-difficulty');
                    const bDiff = b.getAttribute('data-difficulty');
                    return difficultyValue(bDiff) - difficultyValue(aDiff);
                case 'newest':
                    // In a real app, you would compare actual dates
                    return Math.random() - 0.5;
                default: // relevance
                    return 0;
            }
        });
        
        // Re-append sorted cards
        cards.forEach(card => container.appendChild(card));
    }
    
    function popularityValue(pop) {
        const values = { high: 3, medium: 2, low: 1 };
        return values[pop] || 0;
    }
    
    function difficultyValue(diff) {
        const values = { advanced: 3, intermediate: 2, beginner: 1 };
        return values[diff] || 0;
    }
}

function setupActionButtons() {
    // Enroll buttons
    const enrollButtons = document.querySelectorAll('.enroll-btn');
    enrollButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.recommendation-card');
            const courseName = card.querySelector('h3').textContent;
            alert(`Enrolling in: ${courseName}`);
            // In a real app, this would redirect to enrollment page
        });
    });
    
    // Download buttons
    const downloadButtons = document.querySelectorAll('.download-btn');
    downloadButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.recommendation-card');
            const resourceName = card.querySelector('h3').textContent;
            alert(`Downloading: ${resourceName}`);
            // In a real app, this would trigger a download
        });
    });
    
    // Explore buttons
    const exploreButtons = document.querySelectorAll('.explore-btn');
    exploreButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.recommendation-card');
            const careerName = card.querySelector('h3').textContent;
            alert(`Exploring career path: ${careerName}`);
            // In a real app, this would open career details
        });
    });
    
    // Feedback button
    const feedbackBtn = document.querySelector('.feedback-btn');
    if (feedbackBtn) {
        feedbackBtn.addEventListener('click', function() {
            alert('Feedback modal would open here');
            // In a real app, this would open a feedback form
        });
    }
}

function setupRefreshButton() {
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing';
            
            // Simulate API call
            setTimeout(() => {
                alert('Recommendations refreshed based on your recent activity');
                this.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
                this.disabled = false;
            }, 1500);
        });
    }
}
