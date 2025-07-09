document.addEventListener('DOMContentLoaded', function() {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const btn = this.querySelector('.auth-btn');
            const email = document.getElementById('email').value.trim();
            
            // Clear previous errors
            document.getElementById('emailError').style.display = 'none';
            
            // Simple validation
            if (!email) {
                document.getElementById('emailError').textContent = 'Email is required';
                document.getElementById('emailError').style.display = 'block';
                return;
            } else if (!/^\S+@\S+\.\S+$/.test(email)) {
                document.getElementById('emailError').textContent = 'Please enter a valid email';
                document.getElementById('emailError').style.display = 'block';
                return;
            }

            // Simulate sending reset link
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            btn.disabled = true;
            
            // In a real app, you would send the reset link to the email here
            // For simulation, we'll just redirect after a short delay
            setTimeout(() => {
                // Redirect to login page immediately after "sending" the email
                window.location.href = 'login.html';
            }, 1000);
        });
    }
});
