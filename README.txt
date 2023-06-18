# Internetowy komunikator

## ![LIVE DEMO](https://chat.suchanecki.me)

# Instalacja

Aby uruchomić aplikacje lokalnie wymagane jest środowisko Docker oraz Docker Compose.

# Uruchomienie

Przed pierwszym uruchomieniem, należy skonfigurować plik `.env`. W tym celu należy skopiować plik .env.example do .env i wypełnić go odpowiednimi danymi.

Aby uruchomić aplikacje należy wykonać poniższe polecenia w głównym katalogu projektu:

```bash
make install
make up
```

Aplikacja zostanie uruchomiona na porcie 80. ![http://localhost](http://localhost).

Aby wyłączyć aplikacje należy uruchomić:

```bash
make down
```

