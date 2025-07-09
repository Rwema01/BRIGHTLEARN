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

    // Form submission with validation
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
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
    
    // In a real app, this would be an API call to your backend
    // For demo purposes, we'll use a mock user database
    const mockUsers = [
        { email: 'user@example.com', password: 'password123' },
        { email: 'test@test.com', password: 'test123' }
    ];
    
    // Simulate API delay
    setTimeout(() => {
        const user = mockUsers.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Successful login
            // Store user session (in a real app, you'd get a token from your backend)
            if (document.getElementById('remember').checked) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
            
            // Redirect to dashboard
            window.location.href = 'index.html';
        } else {
            // Failed login
            document.getElementById('passwordError').textContent = 'Invalid email or password';
            document.getElementById('passwordError').style.display = 'block';
            btn.innerHTML = '<span>Login</span><i class="fas fa-arrow-right"></i>';
            btn.disabled = false;
        }
    }, 1500);
}

// Optional: Remember email functionality
window.onload = function() {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        document.getElementById('email').value = rememberedEmail;
        document.getElementById('remember').checked = true;
    }
};
