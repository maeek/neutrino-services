# Chat-app

This is a backed for chat api written in nestjs and socket-io

## Installation

To run the app locally you'll need Docker and Docker Compose.

## Running the app

Before first run, you'll need to configure `.env` file. Please copy `.env.example` file and fill it with your data.

To run the app you need to run following commands in project's root directory:

```bash
make install
make up
```

The app will run at port 80 ![http://localhost](http://localhost).

To stop the app run:

```bash
make down
```

