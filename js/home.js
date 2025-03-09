$(document).ready(function() {
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

    // Load existing images
    if (window.getAccessToken()) {
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
                console.error('Error loading images:', xhr.responseJSON?.error);
                if (xhr.status === 401) return; // Handled by refresh
            }
        );
    }

    // Image generation
    $('#imageGenForm').submit(function(e) {
        e.preventDefault();
        if (!window.getAccessToken()) {
            alert('Please log in to generate images.');
            window.location.href = 'login.html';
            return;
        }

        const prompt = $('#prompt').val();
        const negativePrompt = $('#negativePrompt').val();
        const dimensions = $('#dimensions').val();
        const numImages = parseInt($('#numImages').val());

        for (let i = 0; i < numImages; i++) {
            const imageItem = `
                <div class="image-card">
                    <i class="fa fa-circle-o-notch fa-spin" style="font-size:24px;"></i>
                    <img class="img-loading" src="" alt="${prompt}" style="display:none;">
                </div>`;
            $('#imageGallery').prepend(imageItem);
        }

        makeAjaxRequest(
            `${window.API_BASE_URL}/images/generate`,
            'POST',
            { prompt, negativePrompt, dimensions, numImages },
            function(images) {
                const $loadingCards = $('.image-card').has('.img-loading');
                images.forEach((image, index) => {
                    if (index < $loadingCards.length) {
                        const $card = $loadingCards.eq(index);
                        const $img = $card.find('.img-loading');
                        $img.attr('src', image.image_url).css('display', 'block').removeClass('img-loading');
                        $card.find('.fa-spin').remove();
                    }
                });
            },
            function(xhr) {
                console.error('Error creating image:', xhr.responseJSON?.error);
                alert(xhr.responseJSON?.error || 'Failed to generate image');
                $('.image-card').has('.img-loading').remove();
            }
        );

        // $('#prompt').val('');
        // $('#negativePrompt').val('');
    });

    // Gallery modal
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
        link.target = '_blank';
        link.download = `studio-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    $('#galleryModal').click(function(e) {
        if (e.target === this) $(this).fadeOut(200);
    });
});