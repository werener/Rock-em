from django.contrib import admin
from django.template.defaultfilters import pluralize
from django.utils.translation.template import plural_re

# Register your models here.
from .models import Formula

admin.site.register(Formula, name='Formula')