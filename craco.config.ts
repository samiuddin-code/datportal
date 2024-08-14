import path from "path"

module.exports = {
    webpack: {
        alias: {
            "@atoms": path.resolve(__dirname, "src/Components/Atoms"),
            "@organisms": path.resolve(__dirname, "src/Components/Organisms"),
            "@icons": path.resolve(__dirname, "src/Components/Icons"),
            "@modules": path.resolve(__dirname, "src/Modules"),
            "@templates": path.resolve(__dirname, "src/Components/Templates"),
            "@helpers": path.resolve(__dirname, "src/helpers"),
            "@services": path.resolve(__dirname, "src/services"),
        },
    },
};