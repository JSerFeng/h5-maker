"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.copy = exports.compile = exports.rewritePkg = void 0;
const fsp = require("fs").promises;
const rewritePkg = async (dir, cb) => {
    let pkgStr = await fsp.readFile(dir, "utf-8");
    const pkg = JSON.parse(pkgStr);
    cb(pkg);
    const res = JSON.stringify(pkg, null, "\t");
    await fsp.writeFile(dir, res);
};
exports.rewritePkg = rewritePkg;
const compile = (source, data) => {
    let newStr = source;
    Reflect.ownKeys(data).forEach((key) => {
        const regExp = new RegExp("&" + key + "&", "g");
        newStr = newStr.replace(regExp, data[key]);
    });
    return newStr;
};
exports.compile = compile;
const copy = () => {
};
exports.copy = copy;
//# sourceMappingURL=shared.js.map