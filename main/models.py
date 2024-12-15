from json.encoder import INFINITY
from django.db import models


class Formula(models.Model):
    initialUserInput = models.TextField()
    latexCode = models.TextField(max_length=9999999999999)
    parameters = models.JSONField()
