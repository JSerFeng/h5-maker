import { deepCopy } from "../utils"
import { ReactComp, WidgetConfig, WidgetConfigProp, WidgetDescription, WidgetPackage, WidgetProps } from "./interfaces"

type WidgetsMap = Map<string, WidgetPackage>

class WidgetsCenter {
  widgetsMap: WidgetsMap
  subQueue: ((...args: any[]) => any)[]
  constructor(
    initMap: WidgetsMap = new Map()
  ) {
    this.widgetsMap = initMap
    this.subQueue = []
  }

  static createConfig(info: WidgetDescription) {
    const { name, editorConfig, config, initPos } = info
    return {
      name, editorConfig, config, pos: initPos || { x: 10, y: 10, w: 60, h: 60 }
    }
  }

  use(widget: WidgetPackage) {
    const { description, FC, Configuration } = widget
    this.widgetsMap.set(description.name, { FC, description, Configuration })
    this.notify()
  }

  notify() {
    const all = this.getAll()
    this.subQueue.forEach(cb => cb(all))
  }

  subscribe(cb: (all: WidgetPackage[]) => any) {
    this.subQueue.push(cb)
  }

  get(widgetConfig: WidgetConfig | string) {
    let name: string
    if (typeof widgetConfig === "string") {
      name = widgetConfig
    }
    else {
      name = widgetConfig.name
    }

    return this.widgetsMap.get(name) || null
  }

  getAll() {
    const widgets: WidgetPackage[] = []
    this.widgetsMap.forEach((v) => widgets.push(v))
    return widgets
  }

  create(widgetName: string): WidgetConfig | null {
    let widget = this.widgetsMap.get(widgetName)
    if (!widget) return null
    widget.description = deepCopy(widget.description)
    return {
      ...widget.description,
      pos: widget.description.initPos || { x: 10, y: 10, w: 60, h: 60 }
    }
  }
}

export default WidgetsCenter


const defaultDescription: Required<WidgetDescription> = {
  name: "no-name",
  showName: "未命名",
  snapShot: "",
  version: "*",
  editorConfig: [],
  config: {},
  initPos: { x: 0, y: 0, w: 80, h: 80 },
  style: {},
  description: "无描述"
}

export const createPkg = (Comp: ReactComp<WidgetProps>, options: WidgetDescription, Configuration?: ReactComp<WidgetConfigProp>): WidgetPackage => {
  options = { ...defaultDescription, ...options }
  if (Configuration) {
    return {
      FC: Comp as ReactComp<WidgetProps>,
      Configuration,
      description: options
    }
  }
  return {
    FC: Comp as ReactComp<WidgetProps>,
    description: options
  }
}
