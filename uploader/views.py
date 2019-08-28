from django.shortcuts import render

# Create your views here.
from django.views import View


class UploadView(View):
    template_name = 'uploader/uploader.html'

    def get(self, request):
        return render(request, self.template_name)

    def post(self, request):
        self.get(request)
