# Music serving view
import os

from django.http import HttpResponse, Http404
from django.shortcuts import render
from django.views import View

from thesis_prototype import settings


class VisualizerView(View):
    template_name = 'visualizer/visualizer.html'

    def get(self, request):
        return render(request, self.template_name)

    def post(self, request):
        return self.get(request)


def file(request, name):
    file_path = os.path.join(settings.MEDIA_ROOT, name)

    if os.path.exists(file_path):
        with open(file_path, 'rb') as fh:
            response = HttpResponse(fh.read(), content_type="application/")
            response['Content-Disposition'] = 'inline; filename=' + os.path.basename(file_path)

            return response

    raise Http404
