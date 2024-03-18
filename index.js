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
        else return;

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

    function parseArray() {
        if (peek() === "[") i++;
        else return;

        skipWhitespace();

        let array = [];

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
        else return;

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
                const value = parseString() ?? parseObject() ?? parseArray();

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
