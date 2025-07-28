const BASE_URL = 'https://brightlearnbackend.onrender.com/api';

document.addEventListener('DOMContentLoaded', function() {
    setupPasswordToggle();
    setupRegisterForm();
});

// Password toggle functionality
function setupPasswordToggle() {
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    });
}

// Form validation and submission
function setupRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            clearErrors();

            // Validate all fields
            const fullName = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const termsChecked = document.getElementById('terms').checked;

            let isValid = true;

            // Validate full name (2+ words)
            if (!fullName || fullName.split(' ').length < 2) {
                showError('nameError', 'Please enter your full name (first and last name)');
                isValid = false;
            }

            // Validate email
            if (!email) {
                showError('emailError', 'Email is required');
                isValid = false;
            } else if (!/^\S+@\S+\.\S+$/.test(email)) {
                showError('emailError', 'Please enter a valid email');
                isValid = false;
            }

            if (isValid) {
                try {
                    const response = await fetch(`${BASE_URL}/register`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            fullName,
                            email,
                            password
                        }),
                    });

                    const data = await response.json();

                    if (response.ok) {
                        localStorage.setItem('token', data.token);
                        // Decode the JWT token to get userId
                        const payload = JSON.parse(atob(data.token.split('.')[1]));
                        localStorage.setItem('userId', payload.userId);
                        window.location.href = 'index.html';
                    } else {
                        showError('emailError', data.message || 'Registration failed');
                    }
                } catch (error) {
                    console.error('Registration error:', error);
                    showError('emailError', 'An error occurred during registration');
                }
                isValid = false;
            }

            // Validate password (6+ characters)
            if (!password) {
                showError('passwordError', 'Password is required');
                isValid = false;
            } else if (password.length < 6) {
                showError('passwordError', 'Password must be at least 6 characters');
                isValid = false;
            }

            // Validate password match
            if (password !== confirmPassword) {
                showError('confirmPasswordError', 'Passwords do not match');
                isValid = false;
            }

            // Validate terms
            if (!termsChecked) {
                showError('termsError', 'You must agree to the terms & conditions');
                isValid = false;
            }

            // If valid, proceed with registration
            if (isValid) {
                registerUser();
            }
        });
    }
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.style.display = 'none';
    });
}

function registerUser() {
    const btn = document.querySelector('.auth-btn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    btn.disabled = true;

    // Simulate API call
    setTimeout(() => {
        // In a real app, you would send data to your backend here
        console.log('Registration successful!');
        
        // Redirect to login page after 1.5 seconds
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }, 2000);
}
