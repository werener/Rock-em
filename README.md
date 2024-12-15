# Rock-em

1) Скачать python 3.12.8: https://www.python.org/downloads/release/python-3128/
При установке питона надо поставить галочку на 
"add to environmental variables" и "Add python.exe to PATH"
Если питон прежде не был установлен, понадобится перезагрузка компьютера
2) Скачать Docker Desktop: https://www.docker.com/products/docker-desktop/ 
И зарегистрироваться на сайте, после чего залогиниться в приложении 
3) Скачать проект на компьютер
4) Скачать git: https://git-scm.com/downloads
Если git не был установлен прежде, понадобится перезагрузка компьютера
5) Запустить docker desktop
6) Открыть cmd
7) docker login --{username}=user  вместо {username} ваш логин для докера
8)  cd {...}/Rock-em   где {...} - путь до папки с проектом
9) Прописать docker-compose build

Для запуска сервера используется команда:  docker-compose up

Сервер доступен по адресу:  localhost:8000
