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
        registerForm.addEventListener('submit', function(e) {
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

    const formData = {
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value
    };

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showError('emailError', data.error);
            btn.innerHTML = '<span>Register</span><i class="fas fa-arrow-right"></i>';
            btn.disabled = false;
        } else {
            console.log('Registration successful!');
            window.location.href = data.redirectUrl || 'login.html';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showError('emailError', 'Registration failed. Please try again.');
        btn.innerHTML = '<span>Register</span><i class="fas fa-arrow-right"></i>';
        btn.disabled = false;
    });
}