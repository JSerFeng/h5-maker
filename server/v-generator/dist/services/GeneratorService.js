"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const shared_1 = require("../utils/shared");
const REPO_PATH = "direct:https://github.com/JSerFeng/v-generator-template/archive/refs/heads/dev.zip";
const download = require("download-git-repo");
const path = require("path");
const fs = require("fs").promises;
let GeneratorService = class GeneratorService {
    async generate(renderConfig) {
        const _out = path.resolve(process.cwd(), "./tpl/" + renderConfig.projectName);
        try {
            await downloadRepo(_out);
            await writeCode(_out, renderConfig);
            return {
                msg: "success"
            };
        }
        catch (e) {
            console.log(e);
            return e;
        }
    }
};
GeneratorService = __decorate([
    common_1.Injectable()
], GeneratorService);
exports.default = GeneratorService;
const downloadRepo = (output) => new Promise((resolve, reject) => {
    download(REPO_PATH, output, (err) => {
        if (err)
            reject(err);
        else
            resolve(path.join(output, "./src"));
    });
});
const writeCode = async (dir, renderConfig) => {
    const { projectName } = renderConfig;
    const pkgJson = path.resolve(dir, "./package.json");
    shared_1.rewritePkg(pkgJson, pkgJson => {
        pkgJson.name = projectName;
    });
    const renderComponentDir = path.join(dir, "./src/components/RenderMain.tsx");
    renderConfig.widgets.forEach(({ name, version }) => {
        shared_1.rewritePkg(pkgJson, pkgJson => {
            pkgJson.dependencies[name] = version ? version : "*";
        });
    });
    const widgetsNeeded = renderConfig.widgets.map(it => [it.name, it.name[0].toUpperCase() + it.name.slice(1), it]);
    const imports = widgetsNeeded.reduce((calc, [name]) => {
        return calc + `import ${name}Pkg from "${name}";\n`;
    }, "");
    const functionDeclarations = widgetsNeeded.reduce((calc, [name, ReactComponent]) => {
        return calc + `const { FC: ${ReactComponent} } = ${name}Pkg;\n`;
    }, "");
    const allWidgetsCode = widgetsNeeded.reduce((calc, [_, CompoName, { pos: { x, y, w, h }, config, style }]) => {
        return calc + `\t<div style={{position: "absolute", left: ${x}px, top: ${y}px, width: ${w}px, height: ${h}px}}>\n\t\t<${CompoName} style={${JSON.stringify(style || {})}} config={${JSON.stringify(config)}} pos={{x: ${x}, y: ${y}}} />\n\t</div>`;
    }, "");
    const sourceCode = (await fs.readFile(renderComponentDir)).toString();
    const newCode = shared_1.compile(sourceCode, {
        imports, functionDeclarations, widgets: allWidgetsCode
    });
    await fs.writeFile(renderComponentDir, newCode);
};
//# sourceMappingURL=GeneratorService.js.map