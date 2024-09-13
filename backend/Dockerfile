FROM python:3

ARG DJANGO_SUPERUSER_PASSWORD
ARG DJANGO_SUPERUSER_EMAIL
ARG DJANGO_SUPERUSER_USERNAME

RUN echo $DJANGO_SUPERUSER_PASSWORD
RUN echo $DJANGO_SUPERUSER_EMAIL
RUN echo $DJANGO_SUPERUSER_USERNAME

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y \
gettext 

RUN pip install --upgrade pip
RUn pip install --upgrade setuptools
COPY requirements-dev.txt ./
RUN pip install -r requirements-dev.txt
COPY . .

COPY ./wait-for-it.sh /usr/src/app/wait-for-it.sh

RUN chmod +x /usr/src/app/wait-for-it.sh

EXPOSE 8000

CMD ["sh", "-c", "./wait-for-it.sh pgdb:5432 -- python manage.py migrate && python init_db.py && python manage.py runserver 0.0.0.0:8000"]
