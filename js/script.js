$(document).ready(function() {
    const API_BASE_URL = 'http://localhost:3030/api';
    let accessToken = localStorage.getItem('accessToken');
    let refreshToken = localStorage.getItem('refreshToken');
    let isLoggedIn = !!accessToken;

    // Dynamic menu
    function updateNav() {
        const loggedInMenu = `
            <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
            <li class="nav-item"><a class="nav-link" href="gallery.html">Gallery</a></li>
            <li class="nav-item"><a class="nav-link" href="upgrade.html">Upgrade</a></li>
            <li class="nav-item"><a class="nav-link" href="docs.html">Docs</a></li>
            <li class="nav-item"><a class="nav-link" href="#" id="logout">Logout</a></li>
        `;
        const loggedOutMenu = `
            <li class="nav-item"><a class="nav-link" href="login.html">Login</a></li>
            <li class="nav-item"><a class="nav-link" href="register.html">Register</a></li>
            <li class="nav-item"><a class="nav-link" href="upgrade.html">Upgrade</a></li>
            <li class="nav-item"><a class="nav-link" href="docs.html">Docs</a></li>
        `;
        $('#navMenu').html(isLoggedIn ? loggedInMenu : loggedOutMenu);

        // Logout handler
        $('#logout').click(function(e) {
            e.preventDefault();
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            isLoggedIn = false;
            updateNav();
            window.location.href = 'login.html';
        });
    }
    updateNav();

    // Theme toggle
    $('#themeToggle').click(function() {
        $('body').toggleClass('bright-mode dark-mode');
        $(this).toggleClass('btn-light btn-dark');
        $('.bright-icon').toggle();
        $('.dark-icon').toggle();
        localStorage.setItem('theme', $('body').hasClass('dark-mode') ? 'dark' : 'bright');
    });

    // Load theme from localStorage
    if (localStorage.getItem('theme') === 'dark') {
        $('body').removeClass('bright-mode').addClass('dark-mode');
        $('.bright-icon').hide();
        $('.dark-icon').show();
    }

    // Token management
    window.API_BASE_URL = API_BASE_URL;
    window.getAccessToken = () => localStorage.getItem('accessToken');
    window.getRefreshToken = () => localStorage.getItem('refreshToken');
    window.setTokens = (newAccessToken, newRefreshToken) => {
        localStorage.setItem('accessToken', newAccessToken);
        if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
        accessToken = newAccessToken;
        refreshToken = newRefreshToken || refreshToken;
        isLoggedIn = !!accessToken;
        updateNav();
    };

    // Refresh token function
    window.refreshAccessToken = function(callback) {
        const currentRefreshToken = window.getRefreshToken();
        if (!currentRefreshToken) {
            window.location.href = 'login.html';
            return;
        }

        $.ajax({
            url: `${API_BASE_URL}/auth/refresh`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ refreshToken: currentRefreshToken }),
            success: function(response) {
                window.setTokens(response.accessToken, null); // Refresh token might not be renewed
                if (callback) callback();
            },
            error: function(xhr) {
                console.error('Token refresh failed:', xhr.responseJSON?.error);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                isLoggedIn = false;
                updateNav();
                window.location.href = 'login.html';
            }
        });
    };
});