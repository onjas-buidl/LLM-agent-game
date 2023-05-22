# Build Guide

1. Setup OpenAI API key

- Get your key [here](https://platform.openai.com/account/api-keys).
- copy envfile

```
$ cp conf/sample.env conf/local.env
```

- override as your APIkey

2. build and start container

```
$ make build
$ make up
```

3. Exec bash on backend

```
$ make backend
```

access
http://127.0.0.1:9000/


## example api call

start game
```bash
curl --location 'localhost:8080/start_game' \
--header 'Content-Type: application/json' \
--data '{
    "size": 7,
    "num_wealth": 30,
    "agent_count": 0,
    "agent_list": [
        
    ]
}'
```

NOTE: **name must be lower case**


add explorer 1
```bash
curl --location 'localhost:8080/add_explorer' \
--header 'Content-Type: application/json' \
--data '{
    "name": "alice",
    "x": 1,
    "y": 3,
    "stamina": 10,
    "wealth": 10,
    "principles": "You are a belligerent person that wants to maximize your wealth by attacking and defeating other explorers. You are not afraid of death."
}'
```

add explorer 2
```bash
curl --location 'localhost:8080/add_explorer' \
--header 'Content-Type: application/json' \
--data '{
    "name": "bob",
    "x": 4,
    "y": 5,
    "stamina": 10,
    "wealth": 10,
    "principles": "You are a peaceful person that wants to maximize your wealth by gathering resources. You are afraid of death."
}'
```

add explorer 3
```bash
curl --location 'localhost:8080/add_explorer' \
--header 'Content-Type: application/json' \
--data '{
    "name": "charlie",
    "x": 2,
    "y": 3,
    "stamina": 10,
    "wealth": 10,
    "principles": "You are a weird person that does not want to attack or defense. You are afraid of death."
}'
```


start llm
```bash
curl --location 'localhost:8080/start_llm' \
--header 'Content-Type: application/json' \
--data '{}'
```