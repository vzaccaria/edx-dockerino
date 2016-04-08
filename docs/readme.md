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

The server exposes two endpoints at port 5678

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

* OK, result payload
* SERVER ERROR, reason (e.g., cant find octave, something is already running)

### `post /status`

No schema needed; returns:

* OK, server ready
* BUSY, server busy (candidate for destruction)

## Author

* Vittorio Zaccaria

## License
Released under the BSD License.

***
