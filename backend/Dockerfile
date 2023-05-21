FROM python:3.9

WORKDIR /app

COPY requirements.txt ./

EXPOSE 5000

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD [ "python", "./app.py" ]
