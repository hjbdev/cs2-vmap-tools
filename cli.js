import Bun from "bun";
import { parseArgs } from "util";
import parseVmap from './index.js';

const { values } = parseArgs({
    args: Bun.argv,
    options: {
        input: {
            type: "string",
        },
    },
    allowPositionals: true,
});

if (!values.input) {
    console.log("please provide a vmap file");
    process.exit(1);
}

const file = Bun.file(values.input);
const contents = await file.text();

if (!contents.startsWith("<!-- dmx encoding")) {
    console.error("Failed to parse. Are you sure this is a vmap file?");
    process.exit(1);
}

const parsed = parseVmap(contents);

await Bun.write("output.json", JSON.stringify(parsed, null, 4));
