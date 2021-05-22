import { Injectable } from "@nestjs/common"
import { compile, rewritePkg } from "src/utils/shared"
import { RenderConfig, WidgetConfig } from "./schema"

const REPO_PATH = "direct:https://github.com/JSerFeng/v-generator-template/archive/refs/heads/dev.zip"

const download = require("download-git-repo")
const path = require("path")
const fs = require("fs").promises

@Injectable()
export default class GeneratorService {
  async generate(renderConfig: RenderConfig) {
    const _out = path.resolve(process.cwd(), "./tpl/" + renderConfig.projectName)
    try {
      await downloadRepo(_out)
      await writeCode(_out, renderConfig)

      return {
        msg: "success"
      }
    } catch (e) {
      console.log(e);
      return e
    }
  }
}

const downloadRepo = (output: string) => new Promise((resolve, reject) => {
  download(REPO_PATH, output, (err) => {
    if (err) reject(err)
    else resolve(path.join(output, "./src") as string)
  })
}) as Promise<string>

const writeCode = async (dir: string, renderConfig: RenderConfig) => {
  const { projectName } = renderConfig
  const pkgJson = path.resolve(dir, "./package.json")
  //改写package.json的项目名
  rewritePkg(pkgJson, pkgJson => {
    pkgJson.name = projectName
  })

  //将需要安装的组件写在components/RenderMain.tsx中
  const renderComponentDir = path.join(dir, "./src/components/RenderMain.tsx")
  renderConfig.widgets.forEach(({ name, version }) => {
    rewritePkg(pkgJson, pkgJson => {
      pkgJson.dependencies[name] = version ? version : "*"
    })
  })


  const widgetsNeeded = renderConfig.widgets.map(
    it => [it.name, it.name[0].toUpperCase() + it.name.slice(1), it]
  ) as [string, string, WidgetConfig][]

  const imports = widgetsNeeded.reduce((calc, [name]) => {
    return calc + `import ${name}Pkg from "${name}";\n`
  }, "")

  const functionDeclarations = widgetsNeeded.reduce((calc, [name, ReactComponent]) => {
    return calc + `const { FC: ${ReactComponent} } = ${name}Pkg;\n`
  }, "")

  const allWidgetsCode = widgetsNeeded.reduce((calc, [_, CompoName, { pos: { x, y, w, h }, config, style }]) => {
    return calc + `\t<div style={{position: "absolute", left: ${x}px, top: ${y}px, width: ${w}px, height: ${h}px}}>\n\t\t<${CompoName} style={${JSON.stringify(style || {})}} config={${JSON.stringify(config)}} pos={{x: ${x}, y: ${y}}} />\n\t</div>`
  }, "")

  const sourceCode = (await fs.readFile(renderComponentDir) as Buffer).toString()

  const newCode = compile(sourceCode, {
    imports, functionDeclarations, widgets: allWidgetsCode
  })
  await fs.writeFile(renderComponentDir, newCode)
}
