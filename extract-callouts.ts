import Bun from "bun";
import { parseArgs } from "util";
import parseVmap from "./index.ts";
import { CMapEntity, CMapGroup } from "./types.ts";

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

function searchForEnvCsPlace(ob) {
    if (ob.children !== null) {
        ob.children.forEach((child) => {
            // console.log(child);
            // console.log(child.__type);
            if (child.__type === "CMapEntity") {
                const entity = child as CMapEntity;

                if (entity.entity_properties.classname === "env_cs_place") {
                    console.log(entity);
                }
            } else if (child?.children) {
                searchForEnvCsPlace(child);
            }
        });
    }
}

searchForEnvCsPlace(parsed.CMapRootElement.world);

// await Bun.write("output.json", JSON.stringify(parsed, null, 4));
