"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const GeneratorService_1 = require("../services/GeneratorService");
class GeneratorBody {
}
let GeneratorController = class GeneratorController {
    constructor(generateService) {
        this.generateService = generateService;
    }
    async generateSourceCode(body) {
        return await this.generateService.generate({
            widgets: [{
                    name: "text",
                    editorConfig: [],
                    config: { color: "#fff" },
                    pos: { x: 15, y: 23, w: 200, h: 600 }
                }, {
                    name: "canvas",
                    editorConfig: [],
                    config: { people: ["thub", "add"] },
                    pos: { x: 20, y: 666, w: 200, h: 600 }
                }],
            pos: { w: 133, h: 1000 },
            projectName: "app"
        });
    }
};
__decorate([
    common_1.Post(),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GeneratorBody]),
    __metadata("design:returntype", Promise)
], GeneratorController.prototype, "generateSourceCode", null);
GeneratorController = __decorate([
    common_1.Controller('generate'),
    __metadata("design:paramtypes", [GeneratorService_1.default])
], GeneratorController);
exports.default = GeneratorController;
//# sourceMappingURL=GeneratorController.js.map