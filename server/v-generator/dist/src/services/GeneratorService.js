"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const download = require("download-git-repo");
const path = require("path");
const REPO_PATH = "direct:https://github.com/JSerFeng/v-generator-template/archive/refs/heads/dev.zip";
const downloadRepo = (output) => new Promise((resolve, reject) => {
    console.log("download");
    download(REPO_PATH, output, (err) => {
        if (err)
            reject(err);
        else
            resolve(path.join(output));
    });
});
let GeneratorService = class GeneratorService {
    async generate(renderConfig) {
        const _out = path.resolve(process.cwd(), "tpl");
        try {
            const dir = await downloadRepo(_out);
            return dir;
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
//# sourceMappingURL=GeneratorService.js.map