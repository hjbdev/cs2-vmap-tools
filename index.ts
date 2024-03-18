import { CMapGroup, CMapWorld, CStoredCamera, CStoredCameras, DmePlugList, ElementArray, QAngle, Vector3 } from "./types";

export default function parseVmap(str) {
    let i = 0;

    return parseRoot();

    function peek() {
        return str[i];
    }

    function next(n = 1) {
        return str[i + n];
    }

    function skipWhitespace() {
        while (i < str.length && /\s/.test(peek())) i++;
    }

    function parseComment() {
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

    function parseString() {
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

        let array = [];

        while (i < str.length) {
            if (peek() === "]") {
                i++;
                break;
            }

            skipWhitespace();
            const type = parseString();

            let val = null;

            skipWhitespace();
            if (peek() === ",") i++;
            else {
                // objects are stored as "TYPE" \n { ... }
                val = parseObject() ?? parseString() ?? parseArray() ?? null;
            }

            array.push(val ?? type);

            skipWhitespace();
            if (peek() === ",") i++;
        }

        return array.length ? array : null;
    }

    function parseArray() {
        if (peek() === "[") i++;
        else return;

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

    function parseObject() {
        if (peek() === "{") i++;
        else return null;

        skipWhitespace();

        let object = {};

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
                        break;
                    case "CStoredCameras":
                        value = parseObject() as CStoredCameras;
                        break;
                    case "CMapWorld":
                        value = parseObject() as CMapWorld;
                        break;
                    case "CMapGroup":
                        value = parseObject() as CMapGroup;
                        break;
                    case "EditGameClassProps":
                        value = parseObject();
                        break;
                    case "DmePlugList":
                        value = parseObject() as DmePlugList;
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
                    case "object":
                        value = parseObject();
                        break;
                    case "array":
                        value = parseArray();
                        break;
                    default: 
                        value = parseString() ?? parseObject() ?? parseArray();
                        break;
                }

                object[key] = value;

                skipWhitespace();
            }
        }

        return Object.keys(object).length ? object : null;
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
