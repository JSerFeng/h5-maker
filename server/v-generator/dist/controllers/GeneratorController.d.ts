import GeneratorService from 'src/services/GeneratorService';
declare class GeneratorBody {
    path: string;
}
export default class GeneratorController {
    private generateService;
    constructor(generateService: GeneratorService);
    generateSourceCode(body: GeneratorBody): Promise<any>;
}
export {};
