/* eslint-disable @typescript-eslint/explicit-function-return-type */
// Periodically ping the server to keep the session alive
const pingInterval = 300000;
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pingServer = () => {
  fetch('/ping'); // Send a request to a server route to keep the session alive
};
setInterval(pingServer, pingInterval);

// Handle user closing the window
window.addEventListener('beforeunload', async (e) => {
  e.preventDefault();
  await fetch('/logout'); // Send a request to log out the user before the window is closed
  e.returnValue = ''; // This line shows a confirmation dialog to the user, you can customize the message
});

// Add this script to your dashboard.ejs or another client-side JavaScript file

const inactivityTimeout = 5 * 60 * 1000; // 5 minutes
let inactivityTimer;

function logoutUser() {
  // Send a request to log out the user
  fetch('/logout', { method: 'POST' }).then(() => {
    // Redirect to the login page or do any necessary client-side cleanup
    window.location.href = '/login';
  });
}

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(logoutUser, inactivityTimeout);
}

// Initialize the timer and reset it when the user interacts with the page
document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('keydown', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);
document.addEventListener('keyup', resetInactivityTimer);

// Start the timer when the page loads
resetInactivityTimer();
