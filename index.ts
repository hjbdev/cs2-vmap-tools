import {
    CMapEntity,
    CMapGroup,
    CMapRootElement,
    CMapWorld,
    CStoredCamera,
    CStoredCameras,
    DmePlugList,
    ElementArray,
    QAngle,
    VMap,
    Vector3,
} from "./types";

export default function parseVmap(str): VMap {
    let i = 0;

    return parseRoot();

    function peek(): string {
        return str[i];
    }

    function next(n = 1): string {
        return str[i + n];
    }

    function skipWhitespace(): void {
        while (i < str.length && /\s/.test(peek())) i++;
    }

    function parseComment(): string | null {
        if (peek() === "<" && next() === "!" && next(2) === "-" && next(3) === "-") i += 4;
        else return;

        let comment = "";

        // iterate until we hit the end of the comment
        while (i < str.length) {
            if (peek() === "-" && next() === "-" && next(2) === ">") {
                i += 3;
                break;
            }
            comment += peek();
            i++;
        }

        return comment || null;
    }

    function parseString(): string | null {
        if (peek() === '"') i++;
        else return null;

        let string = "";

        // iterate until we hit the end of the string
        while (i < str.length) {
            if (peek() === '"') {
                i++;
                break;
            }
            string += peek();
            i++;
        }

        return string || null;
    }

    function parseElementArray() {
        if (peek() === "[") i++;
        else return null;

        skipWhitespace();

        let array: any[] = [];

        while (i < str.length) {
            if (peek() === "]") {
                i++;
                break;
            }

            skipWhitespace();
            const type = parseString();
            skipWhitespace();

            const val = parseByType(type);
            array.push(val);
            skipWhitespace();

            if (peek() === ",") i++;
        }

        return array.length ? array : null;
    }

    function parseArray(): any[] | null {
        if (peek() === "[") i++;
        else return null;

        skipWhitespace();

        let array: any[] = [];

        while (i < str.length) {
            if (peek() === "]") {
                i++;
                break;
            }

            const value = parseString() ?? parseObject() ?? parseArray();

            skipWhitespace();
            if (peek() === ",") i++;
            skipWhitespace();

            array.push(value);
        }

        return array.length ? array : null;
    }

    function parseObject():
        | CMapWorld
        | CMapGroup
        | CStoredCamera
        | CStoredCameras
        | DmePlugList
        | ElementArray
        | null
        | {} {
        if (peek() === "{") i++;
        else return null;

        skipWhitespace();

        const object = {};

        while (i < str.length) {
            if (peek() === "}") {
                i++;
                break;
            }

            const key = parseString();
            if (key) {
                skipWhitespace();
                const type = parseString();

                skipWhitespace();
                object[key] = parseByType(type);
                skipWhitespace();
            }
        }

        return Object.keys(object).length ? object : null;
    }

    function parseByType(type: string | null) {
        let value: any = null;
        switch (type) {
            case "element_array":
                value = parseElementArray() as ElementArray;
                break;
            case "string":
            case "uint64":
                value = parseString();
                break;
            case "bool":
                value = !!parseString();
                break;
            case "float":
                value = parseFloat(parseString() ?? "0");
                break;
            case "int":
                value = parseInt(parseString() ?? "0");
                break;
            case "CStoredCamera":
                value = parseObject() as CStoredCamera;
                value.__type = "CStoredCamera";
                break;
            case "CStoredCameras":
                value = parseObject() as CStoredCameras;
                value.__type = "CStoredCameras";
                break;
            case "CMapWorld":
                value = parseObject() as CMapWorld;
                value.__type = "CMapWorld";
                break;
            case "CMapGroup":
                value = parseObject() as CMapGroup;
                value.__type = "CMapGroup";
                break;
            case "CMapEntity":
                value = parseObject() as CMapEntity;
                value.__type = "CMapEntity";
                break;
            case "CMapRootElement":
                value = parseObject() as CMapRootElement;
                value.__type = "CMapRootElement";
                break;
            case "EditGameClassProps":
                value = parseObject();
                value.__type = "EditGameClassProps";
                break;
            case "DmePlugList":
                value = parseObject() as DmePlugList;
                value.__type = "DmePlugList";
                break;
            case "string_array":
                value = parseArray() as string[];
                break;
            case "int_array":
                value = parseArray()?.map(Number) as number[];
                break;
            case "qangle":
                const q = parseString()?.split(" ").map(Number) ?? [0, 0, 0];
                value = [q[0], q[1], q[2]] as QAngle;
                break;
            case "vector3":
                const v = parseString()?.split(" ").map(Number) ?? [0, 0, 0];
                value = [v[0], v[1], v[2]] as Vector3;
                break;
            // case "object":
            //     value = parseObject();
            //     break;
            case "array":
                value = parseArray();
                break;
            default:
                value = parseObject() ?? parseString() ?? parseArray();
                break;
        }
        return value;
    }

    function parseRoot() {
        const data = {};
        // expect a comment, then a string, then an object.
        // The string is the key

        const comment = parseComment();
        if (!comment) return;

        skipWhitespace();

        while (peek() != undefined) {
            const key = parseString();
            if (!key) return;

            skipWhitespace();

            const value = parseValue();
            if (!value) return;

            skipWhitespace();

            data[key] = value;
        }

        return Object.keys(data).length ? data : null;
    }

    function parseValue() {
        return parseObject() ?? parseString() ?? parseArray() ?? parseComment();
    }
}
