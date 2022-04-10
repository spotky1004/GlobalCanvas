const paramGetFunctions = {
    "string": "getString",
    "number": "getNumber",
};
export default function getSlashParams(interaction, toGet) {
    const options = interaction.options;
    let params = {};
    for (const name in toGet) {
        if (toGet.hasOwnProperty(name)) {
            const type = toGet[name].type;
            const param = options[paramGetFunctions[type]](name);
            params[name] = param;
        }
    }
    return params;
}
