$(document).ready(function() {
    $('#loginForm').submit(function(e) {
        e.preventDefault();
        const username = $('#username').val();
        const password = $('#password').val();

        $.ajax({
            url: `${window.API_BASE_URL}/auth/login`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username, password }),
            success: function(response) {
                console.log('Login response:', response); // Debug log
                window.setTokens(response.accessToken, response.refreshToken || null); // Use token as accessToken
                window.location.href = 'index.html';
            },
            error: function(xhr) {
                console.error('Login error:', xhr.responseJSON);
                alert(xhr.responseJSON?.error || 'Login failed');
            }
        });
    });
});