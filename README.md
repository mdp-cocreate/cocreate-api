# Cocreate API
The API of Cocreate, a web application that connects digital players for digital projects.

## Installation
```zsh
git clone https://github.com/mdp-cocreate/cocreate-api.git
cd cocreate-api
```

This project requires [Node](https://nodejs.org/en) (18.16.0).
Install the dependencies, by running:
```zsh
npm i
```

Set up your environment variables in a `.env` file at the root of the project. You can follow the [.env.example](.env.example) file.

Initialize your local `MySQL` database, by running:
```zsh
npm run db:init
```

You can now bootstrap the API, by running:
```zsh
npm run start:dev
```

The app is now running!

## Usage
I recommend using [Postman](https://postman.com) to test the API in development.
