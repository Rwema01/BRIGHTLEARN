// Import the API functions
import api from './api.js';

document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // Fetch user profile
        const userProfile = await api.getUserProfile(userId);
        
        // Update profile information in view mode
        if (userProfile) {
            document.getElementById('display-name').textContent = userProfile.fullName || 'Not set';
            document.getElementById('display-email').textContent = userProfile.email || 'Not set';
            document.getElementById('display-bio').textContent = userProfile.bio || 'No bio added yet';
            document.getElementById('display-joined').textContent = new Date(userProfile.createdAt).toLocaleDateString();
            
            // Update editable fields
            document.getElementById('edit-name').value = userProfile.fullName || '';
            document.getElementById('edit-email').value = userProfile.email || '';
            document.getElementById('edit-bio').value = userProfile.bio || '';
            
            // Update profile picture if exists
            if (userProfile.profilePicture) {
                document.getElementById('profile-picture').src = userProfile.profilePicture;
            }
        }

    } catch (error) {
        console.error('Error loading profile:', error);
        alert('Failed to load profile information. Please try again.');
    }

    // Handle profile editing
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const editForm = document.getElementById('profile-edit-form');
    const viewMode = document.querySelector('.detail-view-mode');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    if (editProfileBtn && editForm && viewMode) {
        // Show edit form
        editProfileBtn.addEventListener('click', () => {
            viewMode.style.display = 'none';
            editForm.style.display = 'block';
            editProfileBtn.style.display = 'none';
        });

        // Cancel editing
        cancelEditBtn.addEventListener('click', () => {
            viewMode.style.display = 'block';
            editForm.style.display = 'none';
            editProfileBtn.style.display = 'block';
        });

        // Handle form submission
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const updates = {
                fullName: document.getElementById('edit-name').value.trim(),
                email: document.getElementById('edit-email').value.trim(),
                bio: document.getElementById('edit-bio').value.trim()
            };

            try {
                const response = await fetch(`${api.BASE_URL}/user/${userId}/profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(updates)
                });

                if (!response.ok) {
                    throw new Error('Failed to update profile');
                }

                const updatedProfile = await response.json();

                // Update display values
                document.getElementById('display-name').textContent = updatedProfile.fullName;
                document.getElementById('display-email').textContent = updatedProfile.email;
                document.getElementById('display-bio').textContent = updatedProfile.bio || 'No bio added yet';

                // Show success message
                alert('Profile updated successfully!');

                // Switch back to view mode
                viewMode.style.display = 'block';
                editForm.style.display = 'none';
                editProfileBtn.style.display = 'block';

            } catch (error) {
                console.error('Error updating profile:', error);
                alert('Failed to update profile. Please try again.');
            }
        });
    }
});