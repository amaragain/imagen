$(document).ready(function() {
    $('#registerForm').submit(function(e) {
        e.preventDefault();
        const username = $('#username').val();
        const email = $('#email').val();
        const password = $('#password').val();

        $.ajax({
            url: `${window.API_BASE_URL}/auth/register`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username, email, password }),
            success: function(response) {
                window.setTokens(response.accessToken, response.refreshToken); // Assuming token is accessToken
                window.location.href = 'index.html';
            },
            error: function(xhr) {
                alert(xhr.responseJSON?.error || 'Registration failed');
            }
        });
    });
});