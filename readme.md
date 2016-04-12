# vz-dockerino
> Small container to execute external student octave programs

## Install

Install it with

```
npm install vz-dockerino
```
## Usage

```
Usage:
    vz-dockerino [ -p PORT ]
    vz-dockerino ( -h | --help )

Options:
    -h, --help              help for vz-dockerino
    -p, --port PORT         port on which to listen

Commands:

Arguments:

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


# New features

-     add busy indicator -- [Apr 12th 16](../../commit/cf7dd4f940e3281c1f8153774b1e74a5ea3683a9)
-     add run payload -- [Apr 12th 16](../../commit/5e1138c6173dc689add3fcfd279d455e4cfe96d2)
-     add request parse -- [Apr 11th 16](../../commit/d0b904b1c44e9b584ee087ce7cae33f8fd83e87b)
-     add sandbox creation and command execution -- [Apr 8th 16](../../commit/10f645ea5d46c065492a9716d1e4d1b14be4195e)
-     add interactive nodemon development -- [Apr 6th 16](../../commit/c3d3a03c6509d816aafde1f222a1179135209f18)

# Bug fixes

-     change api endpoint name for the better -- [Apr 12th 16](../../commit/c8f7257c86ea6e144f8126c5c5a394dbe5761fd3)
-     inject deps into the app -- [Apr 12th 16](../../commit/5b29f476495df71b3037313536a33d812f5e0492)
