FROM python:3.11

ENV PYTHONUNBUFFERED True
ENV APP_HOME /app
ENV PYTHONPATH /app
WORKDIR $APP_HOME
COPY . ./

RUN pip install --no-cache-dir -r requirements.txt

# Run using Gunicorn with Uvicorn workers
CMD exec gunicorn \
    --bind :${PORT:-8080} \
    --workers 1 \
    --threads 8 \
    --timeout 120 \
    --graceful-timeout 30 \
    --keep-alive 5 \
    main:app \
    -k uvicorn.workers.UvicornWorker
