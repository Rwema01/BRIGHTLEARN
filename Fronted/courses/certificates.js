document.addEventListener('DOMContentLoaded', function() {
    // Initialize certificate functionality
    initCertificateViewing();
    initCertificateFilters();
    setupActionButtons();
});

function initCertificateViewing() {
    // Set up view buttons
    const viewButtons = document.querySelectorAll('.view-btn');
    const modal = document.getElementById('certificateModal');
    const modalContent = document.querySelector('.modal-certificate-view');
    const closeModal = document.querySelector('.close-modal');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const certificateCard = this.closest('.certificate-card');
            const certificatePreview = certificateCard.querySelector('.certificate-design').cloneNode(true);
            
            // Clear previous content and add new
            modalContent.innerHTML = '';
            modalContent.appendChild(certificatePreview);
            
            // Show modal
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Close modal
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    // Close when clicking outside modal
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

function initCertificateFilters() {
    const courseFilter = document.getElementById('course-filter');
    const dateFilter = document.getElementById('date-filter');
    const certificateCards = document.querySelectorAll('.certificate-card');
    
    function filterCertificates() {
        const courseValue = courseFilter.value;
        const dateValue = dateFilter.value;
        
        certificateCards.forEach(card => {
            const matchesCourse = courseValue === 'all' || card.classList.contains(courseValue);
            
            // In a real app, you would compare actual dates
            const matchesDate = dateValue === 'all'; 
            
            if (matchesCourse && matchesDate) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
        
        // Show empty state if no certificates match
        const visibleCards = document.querySelectorAll('.certificate-card[style="display: block"]');
        const emptyState = document.querySelector('.empty-state');
        
        if (visibleCards.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
        }
    }
    
    courseFilter.addEventListener('change', filterCertificates);
    dateFilter.addEventListener('change', filterCertificates);
}

function setupActionButtons() {
    // Download buttons
    const downloadButtons = document.querySelectorAll('.download-btn');
    downloadButtons.forEach(button => {
        button.addEventListener('click', function() {
            const certificateCard = this.closest('.certificate-card');
            const courseName = certificateCard.classList.contains('math') ? 'Mathematics' : 
                              certificateCard.classList.contains('english') ? 'English' : 'Science';
            
            // In a real app, this would trigger an actual download
            console.log(`Downloading ${courseName} certificate`);
            alert(`Preparing ${courseName} certificate for download...`);
        });
    });
    
    // Share buttons
    const shareButtons = document.querySelectorAll('.share-btn');
    shareButtons.forEach(button => {
        button.addEventListener('click', function() {
            const certificateCard = this.closest('.certificate-card');
            const courseName = certificateCard.classList.contains('math') ? 'Mathematics' : 
                              certificateCard.classList.contains('english') ? 'English' : 'Science';
            
            // In a real app, this would open a share dialog
            console.log(`Sharing ${courseName} certificate`);
            alert(`Share ${courseName} certificate dialog would open here`);
        });
    });
    
    // Print button in modal
    const printButton = document.querySelector('.print-btn');
    if (printButton) {
        printButton.addEventListener('click', function() {
            window.print();
        });
    }
    
    // Bulk actions
    const downloadAll = document.querySelector('.download-all');
    const shareAll = document.querySelector('.share-all');
    
    if (downloadAll) {
        downloadAll.addEventListener('click', function() {
            alert('Preparing all certificates for download as a ZIP file...');
        });
    }
    
    if (shareAll) {
        shareAll.addEventListener('click', function() {
            alert('Share all certificates dialog would open here');
        });
    }
}