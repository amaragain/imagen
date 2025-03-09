$(document).ready(function() {
    if (!window.getAccessToken()) {
        window.location.href = 'login.html';
        return;
    }

    function makeAjaxRequest(url, method, data, successCallback, errorCallback) {
        const token = window.getAccessToken();
        console.log('Sending request to:', url, 'with token:', token); // Debug log
        $.ajax({
            url: url,
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(data),
            success: successCallback,
            error: function(xhr) {
                console.error('Request failed:', xhr.responseJSON);
                if (xhr.status === 401) {
                    window.refreshAccessToken(function() {
                        makeAjaxRequest(url, method, data, successCallback, errorCallback);
                    });
                } else {
                    errorCallback(xhr);
                }
            }
        });
    }

    makeAjaxRequest(
        `${window.API_BASE_URL}/images`,
        'GET',
        null,
        function(images) {
            images.forEach(image => {
                const imageItem = `<div class="image-card"><img src="${image.image_url}" alt="${image.title || 'Generated Image'}"></div>`;
                $('#imageGallery').append(imageItem);
            });
        },
        function(xhr) {
            console.error('Error loading gallery:', xhr.responseJSON?.error);
            if (xhr.status === 401) return; // Handled by refresh
            alert('Failed to load gallery');
        }
    );

    $('#imageGallery').on('click', '.image-card img', function() {
        const src = $(this).attr('src');
        $('#galleryImage').attr('src', src);
        $('#galleryModal').fadeIn(200);
    });

    $('.close-btn').click(function() {
        $('#galleryModal').fadeOut(200);
    });

    $('#downloadBtn').click(function() {
        const imageSrc = $('#galleryImage').attr('src');
        const link = document.createElement('a');
        link.href = imageSrc;
        link.download = `gallery-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    $('#galleryModal').click(function(e) {
        if (e.target === this) $(this).fadeOut(200);
    });
});