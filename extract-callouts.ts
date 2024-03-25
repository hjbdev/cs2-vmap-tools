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

const folder = values.input.substring(0, values.input.lastIndexOf("/"));
const mapName = values.input.substring(values.input.lastIndexOf("/") + 1, values.input.lastIndexOf(".vmap"));

console.log("Map: " + mapName);
console.log("Folder: " + folder);

const file = Bun.file(values.input);
const contents = await file.text();

if (!contents.startsWith("<!-- dmx encoding")) {
    console.error("Failed to parse. Are you sure this is a vmap file?");
    process.exit(1);
}

const parsed = parseVmap(contents);
const envCsPlaces: CMapEntity[] = [];

function searchForEnvCsPlace(ob) {
    if (ob.children !== null) {
        ob.children.forEach((child) => {
            if (child.__type === "CMapEntity") {
                const entity = child as CMapEntity;

                if (entity.entity_properties.classname === "env_cs_place") {
                    envCsPlaces.push(entity);
                }
            } else if (child?.children) {
                searchForEnvCsPlace(child);
            }
        });
    }
}

searchForEnvCsPlace(parsed.CMapRootElement.world);

console.log("Found " + envCsPlaces.length + " env_cs_place entities");

// console.log(envCsPlaces);

const places: any[] = [];

const baseFolder = folder.split("/").slice(0, -1).join("/");

for (const entity of envCsPlaces) {
    const modelDmx = baseFolder + "/" + entity.entity_properties.model.replace(".vmdl", "_hull.dmx");
    const model = Bun.file(modelDmx);
    const contents = await model.text();

    let position: string | null = null;

    for (const line of contents.split("\n")) {
        if (position) continue;
        if (line.includes("position$0") && !line.includes("vertexFormat")) {
            position = line;
        }
    }

    if (!position) {
        console.error("Failed to find position for " + entity.entity_properties.place_name);
        continue;
    }

    //  "position$0" "vector3_array" [ "-2.9802322E-08 32.999977 -31.99999", "-2.9802322E-08 31.999979 32.999985", "-2.9802322E-08 -31.999983 -31.999987", "-2.9802322E-08 -31.999987 32.999985", "1 31.999979 31.999979", "-2.9802322E-08 32.99998 31.99998", "1 31.999983 -31.99999", "1 -31.999987 31.999983", "1 -31.999987 -31.99999" ]

    const positionArray = position.split("[").pop().split("]")[0].split(", ").map((x) => x.replace(/"/g, ""));

    // parse positions
    const positions = positionArray.map((p) => {
        return p.trim().split(" ").map(Number);
    });

    let min_x = 0;
    let min_y = 0;
    let min_z = 0;
    let max_x = 0;
    let max_y = 0;
    let max_z = 0;

    for (const [x, y, z] of positions) {
        if (x < min_x) min_x = x;
        if (y < min_y) min_y = y;
        if (z < min_z) min_z = z;
        if (x > max_x) max_x = x;
        if (y > max_y) max_y = y;
        if (z > max_z) max_z = z;
    }

    const [origin_x, origin_y, origin_z] = entity.origin;

    const place = {
        name: entity.entity_properties.place_name,
        min_x: origin_x + min_x,
        min_y: origin_y + min_y,
        min_z: origin_z + min_z,
        max_x: origin_x + max_x,
        max_y: origin_y + max_y,
        max_z: origin_z + max_z,
    };

    places.push(place);
}

await Bun.write(`${mapName}-places.json`, JSON.stringify(places, null, 4));
