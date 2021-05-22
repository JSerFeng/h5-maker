import { RenderConfig } from "./schema";
export default class GeneratorService {
    generate(renderConfig: RenderConfig): Promise<any>;
}
