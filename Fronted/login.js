document.addEventListener('DOMContentLoaded', function() {
    // Password toggle functionality
    const passwordToggle = document.querySelector('.password-toggle');
    const passwordInput = document.getElementById('password');

    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }

    const BASE_URL = 'https://brightlearnbackend.onrender.com/api';

    // Form submission with validation
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Clear previous errors
            document.getElementById('emailError').style.display = 'none';
            document.getElementById('passwordError').style.display = 'none';
            
            // Get form values
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            
            // Validate inputs
            let isValid = true;
            
            if (!email) {
                document.getElementById('emailError').textContent = 'Email is required';
                document.getElementById('emailError').style.display = 'block';
                isValid = false;
            } else if (!/^\S+@\S+\.\S+$/.test(email)) {
                document.getElementById('emailError').textContent = 'Please enter a valid email';
                document.getElementById('emailError').style.display = 'block';
                isValid = false;
            }
            
            if (!password) {
                document.getElementById('passwordError').textContent = 'Password is required';
                document.getElementById('passwordError').style.display = 'block';
                isValid = false;
            } else if (password.length < 6) {
                document.getElementById('passwordError').textContent = 'Password must be at least 6 characters';
                document.getElementById('passwordError').style.display = 'block';
                isValid = false;
            }

            if (isValid) {
                try {
                    const response = await fetch(`${BASE_URL}/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email, password }),
                    });

                    const data = await response.json();

                    if (response.ok) {
                        localStorage.setItem('token', data.token);
                        // Decode the JWT token to get userId
                        const payload = JSON.parse(atob(data.token.split('.')[1]));
                        localStorage.setItem('userId', payload.userId);
                        window.location.href = 'index.html';
                    } else {
                        document.getElementById('passwordError').textContent = data.message || 'Invalid credentials';
                        document.getElementById('passwordError').style.display = 'block';
                    }
                } catch (error) {
                    console.error('Login error:', error);
                    document.getElementById('passwordError').textContent = 'An error occurred. Please try again.';
                    document.getElementById('passwordError').style.display = 'block';
                }
            }
            
            if (!isValid) return;
            
            // Simulate authentication (in a real app, this would be an API call)
            authenticateUser(email, password);
        });
    }
});

function authenticateUser(email, password) {
    const btn = document.querySelector('.auth-btn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
    btn.disabled = true;
    // Fetch users from localStorage
    const users = JSON.parse(localStorage.getItem('brightlearn_users') || '[]');
    setTimeout(() => {
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            if (document.getElementById('remember').checked) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
            // Optionally store session info
            localStorage.setItem('brightlearn_current_user', JSON.stringify({ fullName: user.fullName, email: user.email }));
            window.location.href = 'index.html';
        } else {
            document.getElementById('passwordError').textContent = 'Invalid email or password';
            document.getElementById('passwordError').style.display = 'block';
            btn.innerHTML = '<span>Login</span><i class="fas fa-arrow-right"></i>';
            btn.disabled = false;
        }
    }, 800);
}

// Optional: Remember email functionality
window.onload = function() {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        document.getElementById('email').value = rememberedEmail;
        document.getElementById('remember').checked = true;
    }
};
