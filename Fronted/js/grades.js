// Import BASE_URL from api.js
import { BASE_URL } from './api.js';

// Helper functions
function getElement(selector) {
    const element = document.querySelector(selector);
    if (!element) {
        console.warn(`Element not found: ${selector}`);
    }
    return element;
}

function updateElementText(selector, text) {
    const element = getElement(selector);
    if (element) {
        element.textContent = text;
    }
}

function updateElementHTML(selector, html) {
    const element = getElement(selector);
    if (element) {
        element.innerHTML = html;
    }
}

function getGradeStatus(score) {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'satisfactory';
    return 'needs-improvement';
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

async function loadGrades() {
    try {
        // Show loading state
        updateElementHTML('#grades-table-body', `
            <tr>
                <td colspan="7" class="loading">Loading grades...</td>
            </tr>
        `);
        
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        if (!token || !userId) {
            window.location.href = 'login.html';
            return;
        }

        const response = await fetch(`${BASE_URL}/student/${userId}/grades`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch grades');
        }

        const grades = await response.json();
        
        // Update grades table
        if (grades.length > 0) {
            updateElementHTML('#grades-table-body', grades.map(grade => `
                <tr>
                    <td>${grade.course}</td>
                    <td>${grade.type}</td>
                    <td>${grade.assignment}</td>
                    <td>${grade.score}%</td>
                    <td>
                        <span class="status ${getGradeStatus(grade.score)}">
                            ${grade.score >= 70 ? 'Passed' : 'Needs Improvement'}
                        </span>
                    </td>
                    <td>${formatDate(grade.date || new Date())}</td>
                    <td>
                        <button class="view-details-btn" onclick="viewGradeDetails('${grade.id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                </tr>
            `).join(''));
        } else {
            updateElementHTML('#grades-table-body', `
                <tr>
                    <td colspan="7" class="no-grades">No grades available yet</td>
                </tr>
            `);
        }

        // Calculate and update summary statistics
        if (grades.length > 0) {
            const totalScore = grades.reduce((sum, grade) => sum + grade.score, 0);
            const averageScore = totalScore / grades.length;
            
            const gradeCircle = document.querySelector('.grade-circle .grade');
            if (gradeCircle) {
                gradeCircle.textContent = `${Math.round(averageScore)}%`;
            }

            const completedCourses = new Set(grades.map(g => g.course)).size;
            const completedElement = document.querySelector('.completed-courses span');
            if (completedElement) {
                completedElement.textContent = completedCourses;
            }

            const assessmentCount = document.querySelector('.assessment-count span');
            if (assessmentCount) {
                assessmentCount.textContent = grades.length;
            }

            const statusIndicator = document.querySelector('.status-indicator span');
            if (statusIndicator) {
                const status = getGradeStatus(averageScore);
                statusIndicator.className = `status-${status}`;
                statusIndicator.textContent = status.replace('-', ' ').charAt(0).toUpperCase() + status.slice(1);
            }
        }

    } catch (error) {
        console.error('Error loading grades:', error);
        const tableBody = document.getElementById('grades-table-body');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="error-message">
                        Error loading grades. Please try again later.
                    </td>
                </tr>
            `;
        }
    }
}

// Initialize grades page
document.addEventListener('DOMContentLoaded', loadGrades);
