from django.contrib import admin
from django.urls import path, include
from . import views
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('', views.main, name='home'),
    path('latex/', views.fromPythonToLatex, name='latex'),
    path('press/', views.buttonPressResponse, name='press'),
    path('view/', views.show_all, name='view'),
    path('insertstream/', views.DBinsert, name="insert"),
    path('zmeika/', views.snake, name="snake")
]

