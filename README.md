# exec-with-env

A simple CLI tool to run commands with environment variables loaded from a file (like `.env`).

## Features
- Loads environment variables from a specified file and merges them with the current environment.
- File-based variables take precedence over existing environment variables.
- Simple CLI interface, suitable for scripting and CI/CD.

## Installation

You can use `npx` to run without installing:

```sh
npx exec-with-env -f <envfile> <command> [args...]
```

Or clone this repo and run locally:

```sh
git clone <this-repo-url>
cd exec-with-env
node index.js -f <envfile> <command> [args...]
```

## Usage

```
npx exec-with-env -f <envfile> <command> [args...]
```

- `-f <envfile>`: (optional) Path to the environment file. Defaults to `.env` if not specified.
- `<command> [args...]`: The command to run with the loaded environment variables.

### Examples

Run a script with variables from `.env`:

```sh
npx exec-with-env -f .env node myscript.js
```

Run a command with a custom env file:

```sh
npx exec-with-env -f config.env echo $MY_VAR
```

If `-f` is omitted, `.env` in the current directory is used:

```sh
npx exec-with-env node myscript.js
```

## Error Handling
- If the env file is missing, an error is printed and the process exits with a non-zero code.
- If the command is missing, usage instructions are printed.

## Testing

This project uses Node's built-in test runner. To run tests:

```sh
npm test
```

## License

MIT
