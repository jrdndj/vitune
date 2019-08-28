$(document).ready(
    function () {
        // Check if json (preprocessed) data already exists
        // If not, go on as usual and perform the preprocessing
        if (typeof json === 'undefined') {
            // Initiate the analysis phase, then get the features of the song
            $.ajax({
                headers: {"X-CSRFToken": csrf_token},
                url: preprocessing_url,
                type: 'POST',
                data: {
                    'form-type': 'analysis',
                    'filename': name,
                    'lyrics': typeof lyrics === 'undefined' ? null : lyrics
                },
                success: function (data) {
                    // Add the music and lyrics URLs to the data
                    data['music_url'] = music_url;

                    if (typeof lyrics_url !== 'undefined') {
                        data['lyrics_url'] = lyrics_url;
                    }
                    initiate_visualization(data);
                },
            })
        } else {
            // Else, retrieve the uploaded json data
            $.getJSON(
                json_url,
                null,
                function success(json) {
                    initiate_visualization(json);
                }
            );
        }
    }
);

function initiate_visualization(data) {
    console.log(data);

    // Save the JSON data to local storage so it may be accessed in the visualizer
    localStorage.setItem('preprocessed-data', JSON.stringify(data));

    // Go to the visualizer page
    window.location.href = visualizer_url;
}
