# vz-dockerino
> {{description}}

## Install

Install it with

```
npm install vz-dockerino
```
## Usage

```
~USAGE~
```

## API

The server exposes two endpoints at port 3000

### `post /payload`

Executes an EDX payload with the following schema:

```json
{
    code {
    base, solution, validation, context, lang
    }
    response
}
```

Answers:

* 200 - OK, result payload
* 503 - Server unavailable

### `post /status`

No schema needed; returns:

* 204 - server ready
* 503 - Server unavailable (candidate for destruction)

## Todo

Add the following API endpoints:

### `post /kill`

* Tries to kill executing program


## Author

* Vittorio Zaccaria

## License
Released under the BSD License.

***
