# Create your views here.
from json import loads

import librosa
import numpy as np
from django.contrib import messages
from django.core.files.storage import FileSystemStorage
from django.http.response import JsonResponse
from django.shortcuts import render
# Create your views here.
from django.views import View
from scipy import ndimage
from scipy.signal import butter, lfilter

from thesis_prototype.settings import MEDIA_ROOT


# Perform lyrics processing
def process_lyrics(lyrics_filename):
    # Read the lyrics file
    file_system_storage = FileSystemStorage()

    lyrics = file_system_storage.open(lyrics_filename, 'r')

    # Then convert it into a dict
    lyrics_dict = {}

    for line in lyrics:
        line = line.strip()

        components = line.split('<>')
        lyrics_dict[float(components[0])] = components[1]

    return lyrics_dict


def butter_bandpass(low_cut, high_cut, fs, order=2):
    nyq = 0.5 * fs
    low = low_cut / nyq
    high = high_cut / nyq
    b, a = butter(order, [low, high], btype='band')

    return b, a


def bandpass_filter(signal, low_cut, high_cut, fs, order=2):
    b, a = butter_bandpass(low_cut, high_cut, fs, order=order)
    signal = lfilter(b, a, signal)

    return signal


# Perform music preprocessing
def preprocess(music_filename, lyrics_filename):
    # Lowest frequency the human ear can hear
    MINIMUM_FREQUENCY = 20

    # Approxumate highest frequency the human hear can hear supported by Librosa
    MAXIMUM_FREQUENCY = 10000

    # Backgrounds: 20 - 250 Hz (contains fundamentals of most instruments)
    # (Sub - bass / Bass)
    BACKGROUNDS_MINIMUM = MINIMUM_FREQUENCY
    BACKGROUNDS_MAXIMUM = 250

    # Lowgrounds: 251 - 2000 Hz (contains low vocals)
    # (Low - midrange / Midrange)
    LOWGROUNDS_MINIMUM = BACKGROUNDS_MAXIMUM + 1
    LOWGROUNDS_MAXIMUM = 2000

    # Highgrounds: 2001 - 6000 Hz (contains high vocals and low percussive instruments)
    # (Upper - midrange / Presence)
    HIGHGROUNDS_MINIMUM = LOWGROUNDS_MAXIMUM + 1
    HIGHGROUNDS_MAXIMUM = 6000

    # Foregrounds: 6001 - 14000 Hz (contains high percussive instruments)
    # (Brilliance)
    FOREGROUNDS_MINIMUM = HIGHGROUNDS_MAXIMUM + 1
    FOREGROUNDS_MAXIMUM = MAXIMUM_FREQUENCY

    # Margin for HPSS separation
    MARGIN = 16.0

    # Bins per semitone (the higher, the more accurate and restrictive the chroma values are)
    SEMITONES = 12
    BINS_PER_SEMITONE = SEMITONES * 3

    # Retrieve the audio file
    name = music_filename
    music_filename = MEDIA_ROOT + music_filename

    # Load the audio file, and then yield:
    # y - a list of audio signals representing the music
    # sr - the sampling rate of the music (how many samples there are per second)
    y, sr = librosa.load(music_filename)

    # Decompose the music into its harmonic and percussive components
    y_harmonic, y_percussive = librosa.effects.hpss(y, margin=MARGIN)

    # Perform beat detection on the percussive component, for more accurate
    # results, and then yield:
    # tempo - an estimation of how fast (in beats per minute) the song is
    # beat_frames - the frames representing a beat
    tempo, beat_frames = librosa.beat.beat_track(y=y_percussive, sr=sr)

    # Separate the harmonic signal into four different components
    harmonic_bass = bandpass_filter(y_harmonic, BACKGROUNDS_MINIMUM, BACKGROUNDS_MAXIMUM, sr)
    harmonic_lowmidrange = bandpass_filter(y_harmonic, LOWGROUNDS_MINIMUM, LOWGROUNDS_MAXIMUM, sr)
    harmonic_highmidrange = bandpass_filter(y_harmonic, HIGHGROUNDS_MINIMUM, HIGHGROUNDS_MAXIMUM, sr)
    harmonic_presence = bandpass_filter(y_harmonic, FOREGROUNDS_MINIMUM, FOREGROUNDS_MAXIMUM, sr)

    # Construct chromagrams of the harmonic components of the music
    chroma_bass = librosa.feature.chroma_cqt(y=harmonic_bass, sr=sr, bins_per_octave=BINS_PER_SEMITONE)
    chroma_lowmidrange = librosa.feature.chroma_cqt(y=harmonic_lowmidrange, sr=sr, bins_per_octave=BINS_PER_SEMITONE)
    chroma_highmidrange = librosa.feature.chroma_cqt(y=harmonic_highmidrange, sr=sr, bins_per_octave=BINS_PER_SEMITONE)
    chroma_presence = librosa.feature.chroma_cqt(y=harmonic_presence, sr=sr, bins_per_octave=BINS_PER_SEMITONE)

    # Apply non-local filtering
    chroma_bass = np.minimum(chroma_bass,
                             librosa.decompose.nn_filter(
                                 chroma_bass, aggregate=np.median, metric='cosine'))

    chroma_lowmidrange = np.minimum(chroma_lowmidrange,
                                    librosa.decompose.nn_filter(
                                        chroma_lowmidrange, aggregate=np.median, metric='cosine'))

    chroma_highmidrange = np.minimum(chroma_highmidrange,
                                     librosa.decompose.nn_filter(
                                         chroma_highmidrange, aggregate=np.median, metric='cosine'))

    chroma_presence = np.minimum(chroma_presence,
                                 librosa.decompose.nn_filter(
                                     chroma_presence, aggregate=np.median, metric='cosine'))

    # Apply horizontal median filtering
    chroma_bass = ndimage.median_filter(chroma_bass, size=(1, 9))
    chroma_lowmidrange = ndimage.median_filter(chroma_lowmidrange, size=(1, 9))
    chroma_highmidrange = ndimage.median_filter(chroma_highmidrange, size=(1, 9))
    chroma_presence = ndimage.median_filter(chroma_presence, size=(1, 9))

    # Adjust the shape of the beat frames to match with the shape of the chroma
    beat_frames = librosa.util.fix_frames(beat_frames, x_max=chroma_bass.shape[1])

    # Then put them together, now that they have the same shape
    beat_chroma_bass = librosa.util.sync(chroma_bass, beat_frames, aggregate=np.mean)
    beat_chroma_lowmidrange = librosa.util.sync(chroma_lowmidrange, beat_frames, aggregate=np.mean)
    beat_chroma_highmidrange = librosa.util.sync(chroma_highmidrange, beat_frames, aggregate=np.mean)
    beat_chroma_presence = librosa.util.sync(chroma_presence, beat_frames, aggregate=np.mean)

    # Append blank energies to the chromas to align its length to the list of beat timestamps
    beat_chroma_bass = np.hstack((np.zeros((beat_chroma_bass.shape[0], 1)), beat_chroma_bass))
    beat_chroma_lowmidrange = np.hstack((np.zeros((beat_chroma_lowmidrange.shape[0], 1)), beat_chroma_lowmidrange))
    beat_chroma_highmidrange = np.hstack((np.zeros((beat_chroma_highmidrange.shape[0], 1)), beat_chroma_highmidrange))
    beat_chroma_presence = np.hstack((np.zeros((beat_chroma_presence.shape[0], 1)), beat_chroma_presence))

    # Convert the frame indices of the beat events into timestamps
    beat_times = librosa.frames_to_time(beat_frames, sr=sr)

    # Gather all necessary data in a dictionary
    data = {
        'beat_times': beat_times.tolist(),
        'chroma_bass': beat_chroma_bass.tolist(),
        'chroma_lowmidrange': beat_chroma_lowmidrange.tolist(),
        'chroma_highmidrange': beat_chroma_highmidrange.tolist(),
        'chroma_presence': beat_chroma_presence.tolist(),
        'name': name,
        'lyrics': process_lyrics(lyrics_filename) if lyrics_filename else '',
    }

    # Return them in a json response
    return JsonResponse(data)


class AnalyzerView(View):
    template_name = 'analyzer/analyzer.html'

    def get(self, request):
        return self.post(request)

    def post(self, request):
        # Check which type of post request it is - whether it's an
        # upload or an analysis
        form_type = request.POST.get('form-type', False)

        context = {}

        if form_type == 'upload':
            # Handle the upload mechanism
            music = request.FILES.get('music', False)
            lyrics = request.FILES.get('lyrics', False)
            json = request.FILES.get('json', False)

            if music is not False:
                # Save the files into the file system
                file_system_storage = FileSystemStorage()

                music_filename = file_system_storage.save(music.name, music)
                context['name'] = music_filename

                if lyrics is not False:
                    lyrics_filename = file_system_storage.save(lyrics.name, lyrics)

                    # Take note of its name (for accessing the URL later)
                    context['lyrics'] = lyrics_filename
                elif json is not False:
                    # Take note of the json file
                    json_filename = file_system_storage.save(json.name, json)

                    # Take note of its name (for accessing the URL later)
                    context['json'] = json_filename
            else:
                messages.error(request, 'Invalid request.')
        elif form_type == 'analysis':
            # Get the music URL
            music_filename = request.POST.get('filename', False)

            # Get the lyrics URL
            lyrics_filename = request.POST.get('lyrics', False)

            if music_filename is not False:
                # Handle the analysis mechanism (to be called via AJAX)
                return preprocess(music_filename, lyrics_filename)
            else:
                messages.error(request, 'Invalid request.')
        else:
            messages.error(request, 'Invalid request.')

        return render(request, self.template_name, context)
