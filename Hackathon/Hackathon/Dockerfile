FROM python:3.12.8

SHElL ["/bin/BASH", "-c"]

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN pip install --upgrade pip

RUN apt update && apt -qy install gcc libjpeg-dev libxslt-dev \
    libpq-dev libmariadb-dev libmariadb-dev-compat gettext cron openssh-client flake8 locales vim

RUN useradd -rms /bin/bash yt && chmod 777 /opt /run

WORKDIR /yt

RUN mkdir /yt/static && mkdir /yt/templates && chown -R yt:yt /yt && chmod 755 /yt

COPY --chown=yt:yt . .

RN pip install -r requirments.txt

USER yt

CMD ["python","manage.py","runserver", "0.0.0.0:8000"]

