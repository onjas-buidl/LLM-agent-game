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
