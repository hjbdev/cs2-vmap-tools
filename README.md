# CS2 VMap Parsing + Place Name Extraction

The CLI is written for Bun. The parseVmap library will work with either Bun or Node.

If you want to read about how this library came about, click [here](https://hjb.dev/posts/counter-strike-2-where-are-all-the-callouts-2).

## The Problem
In CS:GO, you could extract place names from maps by parsing the nav file. In 2, place names are stored as env_cs_place entities.

## Decompilation
First, decompile your map with [Source 2 Viewer](https://valveresourceformat.github.io/). We need the **entire** map decompiled, entities and all. Don't change the folder structure after decompile.

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
