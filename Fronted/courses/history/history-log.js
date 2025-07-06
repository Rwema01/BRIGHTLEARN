// Sample history data
const historyData = [
    {
        id: 1,
        type: 'course',
        icon: 'book',
        title: 'Completed Algebra Basics',
        description: 'Finished all lessons and quizzes in Algebra Basics course',
        time: '2023-06-15T14:30:00',
        details: {
            course: 'Algebra Basics',
            score: '92%',
            completionDate: 'June 15, 2023',
            timeSpent: '4 hours 22 minutes'
        }
    },
    {
        id: 2,
        type: 'quiz',
        icon: 'check-circle',
        title: 'Passed History Quiz',
        description: 'Scored 85% on World History Quiz #2',
        time: '2023-06-12T09:15:00',
        details: {
            quiz: 'World History Quiz #2',
            score: '85%',
            dateTaken: 'June 12, 2023',
            questions: '20/24 correct'
        }
    },
    {
        id: 3,
        type: 'login',
        icon: 'sign-in-alt',
        title: 'Logged in from new device',
        description: 'New login from Chrome on Windows',
        time: '2023-06-10T18:45:00',
        details: {
            device: 'Chrome on Windows',
            location: 'New York, NY',
            ipAddress: '192.168.1.1'
        }
    },
    {
        id: 4,
        type: 'certificate',
        icon: 'certificate',
        title: 'Earned Certificate',
        description: 'Certificate awarded for completing English Literature',
        time: '2023-06-05T11:20:00',
        details: {
            course: 'English Literature',
            certificateId: 'CER-2023-ENGL-0456',
            dateAwarded: 'June 5, 2023'
        }
    }
];

// DOM elements with null checks
function getElement(selector, isMultiple = false) {
    try {
        return isMultiple 
            ? document.querySelectorAll(selector) 
            : document.querySelector(selector);
    } catch (error) {
        console.error(`Error getting element: ${selector}`, error);
        return isMultiple ? [] : null;
    }
}

const elements = {
    historyLog: getElement('.history-log'),
    historySearch: getElement('#historySearch'),
    timeFilter: getElement('#timeFilter'),
    exportBtn: getElement('#exportHistory'),
    clearBtn: getElement('#clearHistory'),
    historyModal: getElement('#historyModal'),
    historyModalTitle: getElement('#historyModalTitle'),
    historyModalContent: getElement('#historyModalContent'),
    closeModalBtn: getElement('.close-modal'),
    closeHistoryModalBtn: getElement('#closeHistoryModal')
};

// Initialize history log
function initHistoryLog() {
    // Verify essential elements exist
    if (!elements.historyLog || !elements.historyModal) {
        console.error('Essential elements not found');
        return;
    }

    renderHistory(historyData);
    
    // Safe event listener attachment
    function safeAddListener(element, event, handler) {
        if (element && handler) {
            element.addEventListener(event, handler);
        }
    }

    safeAddListener(elements.historySearch, 'input', filterHistory);
    safeAddListener(elements.timeFilter, 'change', filterHistory);
    safeAddListener(elements.exportBtn, 'click', exportHistory);
    safeAddListener(elements.clearBtn, 'click', clearHistory);
    safeAddListener(elements.closeModalBtn, 'click', closeHistoryModal);
    safeAddListener(elements.closeHistoryModalBtn, 'click', closeHistoryModal);
    
    // Close modal when clicking outside
    if (elements.historyModal) {
        elements.historyModal.addEventListener('click', function(e) {
            if (e.target === elements.historyModal) {
                closeHistoryModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && elements.historyModal.style.display === 'flex') {
            closeHistoryModal();
        }
    });
}

// Render history items with validation
function renderHistory(historyItems) {
    if (!elements.historyLog) return;

    if (!historyItems || historyItems.length === 0) {
        elements.historyLog.innerHTML = `
            <div class="empty-history">
                <i class="fas fa-history"></i>
                <h3>No history available</h3>
                <p>Your activity history will appear here</p>
            </div>
        `;
        return;
    }
    
    try {
        elements.historyLog.innerHTML = historyItems.map(item => `
            <div class="history-item" data-id="${item.id}">
                <div class="history-icon">
                    <i class="fas fa-${item.icon || 'history'}"></i>
                </div>
                <div class="history-content">
                    <h3 class="history-title">${item.title || 'No title'}</h3>
                    <p class="history-description">${item.description || 'No description'}</p>
                    <div class="history-time">${formatDateTime(item.time)}</div>
                </div>
            </div>
        `).join('');
        
        // Add click event to history items
        getElement('.history-item', true).forEach(item => {
            item.addEventListener('click', function() {
                const itemId = parseInt(this.getAttribute('data-id'));
                const historyItem = historyData.find(item => item.id === itemId);
                if (historyItem) {
                    openHistoryModal(historyItem);
                }
            });
        });
    } catch (error) {
        console.error('Error rendering history:', error);
    }
}

// Filter history with validation
function filterHistory() {
    try {
        const searchTerm = elements.historySearch?.value.toLowerCase() || '';
        const timeRange = elements.timeFilter?.value || 'all';
        
        const filtered = historyData.filter(item => {
            // Safe property access
            const title = item.title?.toLowerCase() || '';
            const description = item.description?.toLowerCase() || '';
            
            // Filter by search term
            const matchesSearch = title.includes(searchTerm) || 
                                description.includes(searchTerm);
            
            // Filter by time range
            if (!item.time) return matchesSearch;
            
            try {
                const itemDate = new Date(item.time);
                if (isNaN(itemDate.getTime())) return matchesSearch;
                
                const now = new Date();
                let matchesTime = true;
                
                if (timeRange === 'today') {
                    matchesTime = itemDate.toDateString() === now.toDateString();
                } else if (timeRange === 'week') {
                    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    matchesTime = itemDate >= oneWeekAgo;
                } else if (timeRange === 'month') {
                    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                    matchesTime = itemDate >= oneMonthAgo;
                }
                
                return matchesSearch && matchesTime;
            } catch (e) {
                console.error('Date filtering error:', e);
                return matchesSearch;
            }
        });
        
        renderHistory(filtered);
    } catch (error) {
        console.error('Error filtering history:', error);
    }
}

// Robust date formatting
function formatDateTime(dateTimeString) {
    try {
        if (!dateTimeString) return 'Date not available';
        
        const date = new Date(dateTimeString);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date');
        }
        
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    } catch (error) {
        console.error('Date formatting error:', error);
        return 'Date not available';
    }
}

// Modal functions with validation
function openHistoryModal(item) {
    if (!item || !elements.historyModal || !elements.historyModalTitle || !elements.historyModalContent) {
        console.error('Invalid arguments or missing modal elements');
        return;
    }

    try {
        elements.historyModalTitle.textContent = item.title || 'Activity Details';
        
        let detailsHtml = `
            <p><strong>Activity:</strong> ${item.description || 'No description'}</p>
            <p><strong>Date:</strong> ${formatDateTime(item.time)}</p>
        `;

        if (item.details) {
            detailsHtml += `<div class="details-section"><h4>Details</h4>`;
            for (const [key, value] of Object.entries(item.details)) {
                detailsHtml += `<p><strong>${formatKey(key)}:</strong> ${value || 'N/A'}</p>`;
            }
            detailsHtml += `</div>`;
        }

        elements.historyModalContent.innerHTML = detailsHtml;
        elements.historyModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Error opening history modal:', error);
    }
}

function closeHistoryModal() {
    if (elements.historyModal) {
        elements.historyModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Format object keys safely
function formatKey(key) {
    try {
        if (!key) return '';
        return key.split(/(?=[A-Z])/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    } catch (error) {
        console.error('Error formatting key:', error);
        return key;
    }
}

// Export history with validation
function exportHistory() {
    try {
        // In a real app, this would generate a file for download
        alert('History exported successfully! This would download a file in a real application.');
    } catch (error) {
        console.error('Error exporting history:', error);
        alert('Failed to export history');
    }
}

// Clear history with confirmation
function clearHistory() {
    try {
        if (confirm('Are you sure you want to clear your history? This cannot be undone.')) {
            // In a real app, this would send a request to the server
            renderHistory([]);
            alert('History cleared successfully!');
        }
    } catch (error) {
        console.error('Error clearing history:', error);
        alert('Failed to clear history');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHistoryLog);
} else {
    initHistoryLog();
}