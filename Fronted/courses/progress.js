document.addEventListener('DOMContentLoaded', function() {
    // Initialize Circular Progress Bars
    initCircularProgress();
    
    // Initialize Activity Calendar
    initActivityCalendar();
    
    // Set up filter buttons
    setupFilterButtons();
    
    // Set up course progress hover effects
    setupCourseHoverEffects();
    
    // Simulate loading data (in a real app, this would be API calls)
    simulateDataLoading();
});

// Initialize circular progress bars
function initCircularProgress() {
    const progressElements = document.querySelectorAll('.circular-progress');
    
    progressElements.forEach(element => {
        const progress = element.getAttribute('data-progress');
        const circle = element.querySelector('.progress-ring-circle');
        const radius = circle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        
        circle.style.strokeDasharray = circumference;
        circle.style.strokeDashoffset = circumference - (progress / 100) * circumference;
        
        // Animate progress
        setTimeout(() => {
            circle.style.transition = 'stroke-dashoffset 1s ease-in-out';
        }, 100);
    });
}

// Initialize activity calendar visualization
function initActivityCalendar() {
    const calendarPlaceholder = document.querySelector('.calendar-placeholder');
    if (!calendarPlaceholder) return;
    
    // Remove placeholder text
    calendarPlaceholder.innerHTML = '';
    
    // Create calendar container
    const calendar = document.createElement('div');
    calendar.className = 'activity-calendar-grid';
    
    // Add month header
    const monthHeader = document.createElement('div');
    monthHeader.className = 'calendar-month-header';
    monthHeader.textContent = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    calendar.appendChild(monthHeader);
    
    // Add day headers
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = day;
        calendar.appendChild(dayHeader);
    });
    
    // Calculate days in month
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Calculate first day of month
    const firstDay = new Date(year, month, 1).getDay();
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day empty';
        calendar.appendChild(emptyCell);
    }
    
    // Add day cells with random activity levels (simulated data)
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        
        // Add date
        const dateElement = document.createElement('span');
        dateElement.className = 'day-date';
        dateElement.textContent = day;
        dayCell.appendChild(dateElement);
        
        // Add activity level (simulated)
        const activityLevel = Math.floor(Math.random() * 4); // 0-3
        if (activityLevel > 0) {
            const activityElement = document.createElement('div');
            activityElement.className = `activity-level level-${activityLevel}`;
            dayCell.appendChild(activityElement);
            
            // Add tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'activity-tooltip';
            tooltip.textContent = `${activityLevel * 30} mins on ${month + 1}/${day}/${year}`;
            dayCell.appendChild(tooltip);
            
            // Show tooltip on hover
            dayCell.addEventListener('mouseenter', () => {
                tooltip.style.visibility = 'visible';
                tooltip.style.opacity = '1';
            });
            
            dayCell.addEventListener('mouseleave', () => {
                tooltip.style.visibility = 'hidden';
                tooltip.style.opacity = '0';
            });
        }
        
        // Highlight current day
        if (day === date.getDate() && month === date.getMonth()) {
            dayCell.classList.add('today');
        }
        
        calendar.appendChild(dayCell);
    }
    
    calendarPlaceholder.appendChild(calendar);
}

// Set up filter buttons
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // In a real app, you would filter data here
            console.log(`Filter changed to: ${this.textContent}`);
        });
    });
}

// Set up course card hover effects
function setupCourseHoverEffects() {
    const courseCards = document.querySelectorAll('.course-progress-card');
    
    courseCards.forEach(card => {
        const progressBar = card.querySelector('.progress-fill');
        const originalWidth = progressBar.style.width;
        
        card.addEventListener('mouseenter', () => {
            // Animate progress bar on hover
            progressBar.style.transition = 'width 0.5s ease-in-out';
            progressBar.style.width = '100%';
        });
        
        card.addEventListener('mouseleave', () => {
            // Return to original width
            progressBar.style.width = originalWidth;
        });
    });
}

// Simulate data loading
function simulateDataLoading() {
    // Show loading state
    const loadingElements = document.querySelectorAll('.stat-value, .progress-value, .completion-percent');
    loadingElements.forEach(el => {
        el.textContent = '--';
    });
    
    // Simulate API delay
    setTimeout(() => {
        // In a real app, you would update with actual data
        document.querySelector('.progress-value').textContent = '72%';
        document.querySelector('.stat-value:nth-of-type(1)').textContent = '5';
        document.querySelector('.stat-value:nth-of-type(2)').textContent = '3';
        document.querySelector('.stat-value:nth-of-type(3)').textContent = '36h 45m';
        
        // Update course progress percentages
        document.querySelectorAll('.completion-percent').forEach((el, index) => {
            el.textContent = index === 0 ? '69%' : '42%';
        });
        
        // Update stats
        document.querySelectorAll('.stat-item .stat-value').forEach((el, index) => {
            const values = ['12/20', '82%', '2 days ago', '8/18', '78%', '1 week ago'];
            el.textContent = values[index];
        });
    }, 1000);
}

// Utility function for future API calls
function fetchProgressData(timeframe = 'all') {
    // In a real app, this would fetch from your API
    return new Promise((resolve) => {
        setTimeout(() => {
            const mockData = {
                overallCompletion: 72,
                coursesCompleted: 5,
                activeCourses: 3,
                timeSpent: '36h 45m',
                courses: [
                    { name: 'Mathematics', progress: 69, completed: '12/20', score: '82%', lastActive: '2 days ago' },
                    { name: 'English Literature', progress: 42, completed: '8/18', score: '78%', lastActive: '1 week ago' }
                ],
                achievements: [
                    { title: 'Math Whiz', description: 'Scored 90% or higher on 5 math quizzes', date: 'Jun 15, 2023', tier: 'gold' },
                    { title: 'Bookworm', description: 'Completed 10 literature reading assignments', date: 'May 28, 2023', tier: 'silver' },
                    { title: 'Quick Learner', description: 'Completed a course module in one sitting', date: 'May 10, 2023', tier: 'bronze' }
                ]
            };
            resolve(mockData);
        }, 500);
    });
}

// Additional styles for calendar (would normally be in CSS, but included here for completeness)
function addCalendarStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .activity-calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 8px;
            text-align: center;
        }
        
        .calendar-month-header {
            grid-column: span 7;
            font-weight: bold;
            margin-bottom: 10px;
            color: var(--text-dark);
        }
        
        .calendar-day-header {
            font-size: 0.8rem;
            color: var(--text-medium);
            padding: 5px 0;
        }
        
        .calendar-day {
            position: relative;
            height: 40px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-radius: var(--radius-sm);
            background-color: var(--bg-light);
        }
        
        .calendar-day.today {
            border: 1px solid var(--primary-blue);
        }
        
        .day-date {
            font-size: 0.7rem;
            margin-bottom: 2px;
        }
        
        .activity-level {
            width: 16px;
            height: 4px;
            border-radius: 2px;
        }
        
        .activity-level.level-1 {
            background-color: var(--primary-light);
        }
        
        .activity-level.level-2 {
            background-color: var(--primary-blue);
        }
        
        .activity-level.level-3 {
            background-color: var(--primary-dark);
        }
        
        .activity-tooltip {
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background-color: var(--text-dark);
            color: white;
            padding: 5px 10px;
            border-radius: var(--radius-sm);
            font-size: 0.8rem;
            white-space: nowrap;
            visibility: hidden;
            opacity: 0;
            transition: var(--transition);
            z-index: 10;
            margin-bottom: 5px;
        }
        
        .activity-tooltip::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border-width: 5px;
            border-style: solid;
            border-color: var(--text-dark) transparent transparent transparent;
        }
    `;
    document.head.appendChild(style);
}

// Add calendar styles when the page loads
addCalendarStyles();