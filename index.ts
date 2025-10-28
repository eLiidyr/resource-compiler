import { readdirSync } from "fs";
import { join } from "path";
const args = Bun.argv.slice(1);
const options: Record<string, string> = {};

args.forEach(arg => {
    const [key, value] = arg.split("=");

    if (key && value) {
        options[key.replace(/^--/, "")] = value;

    }

});

const directory = options.resources ?? "D:\\Windower\\res";
const resources = readdirSync(directory);

const convert = (data: string): Blob => {
    let code = data.replace(/^[\s\S]*?(?=return)/, "").trimStart();
    code = code.replace(/^return\s+/, "").trim();
    code = code.replace(/\[(\d+)\]\s*=/g, '"$1":').replace(/([a-zA-Z_][a-zA-Z0-9_]*)\s*=/g, '"$1":').replace(/, {["\w+",\s]+}/g, "");
    let match = code.match(/\{[\s\S]*\}/);


    if (match) {
        code = match[0].trim();
        code = code.replace(/,(\s*})$/, "$1");
        return new Blob([code], { type: "application/json" });

    }
    return new Blob([], { type: "text/plain" });
}

const convertResources = async () => {

    for (const filename of resources) {
        console.log(`Converting ${filename} to JSON resource.`);

        const name = filename.replace(/.lua/, "");
        const code = await Bun.file(join(directory, filename)).text();
        const file = convert(code);

        console.log(`Writing ${name}.json to file.`);
        await Bun.write(`./resources/${name}.json`, file);
        console.log(`${name}.json created!`);

    }

}
await convertResources();