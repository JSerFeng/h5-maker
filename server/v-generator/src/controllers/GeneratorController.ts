import { Controller, Post, Body } from '@nestjs/common';
import GeneratorService from 'src/services/GeneratorService';


class GeneratorBody {
  path: string
}

@Controller('generate')
export default class GeneratorController {

  constructor(private generateService: GeneratorService) { }

  @Post()
  async generateSourceCode(@Body() body: GeneratorBody) {
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
    })
  }
}
