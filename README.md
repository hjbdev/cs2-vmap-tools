# CS2 VMap Tools

The CLI is written for Bun. The parseVmap library will work with either Bun or Node.

## Decompilation
First, decompile your map with [Source 2 Viewer](https://valveresourceformat.github.io/). We only need the `vmap` file. `vmap_c` will NOT work.

## Usage
Import the vmap file as a string. Call `parseVMap` with that string.

```js
import parseVMap from 'cs2-vmap-tools';

const vmap = parseVMap(/* string here */)
```

```bash
bun cli.js --input=".\de_vertigo.vmap"
```

## Installation

```bash
bun add cs2-vmap-tools
```

## To-do

Callouts are entities now, as such to work out the dimensions I need to parse the model associated with them. The actual dimensions aren't stored in the vmap file.
