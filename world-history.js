// script.js

// Show an alert when any link is clicked
document.querySelectorAll('.card a').forEach(link => {
  link.addEventListener('click', function() {
    alert("You are about to visit an external educational resource.");
  });
});
