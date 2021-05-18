import { WidgetConfig, WidgetDescription, WidgetPackage } from "./interfaces"

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
    const { description, FC } = widget
    this.widgetsMap.set(description.name, { FC, description })
    this.notify()
  }

  notify() {
    const all = this.getAll()
    this.subQueue.forEach(cb => cb(all))
  }

  subscribe(cb: (all: WidgetPackage[]) => any) {
    this.subQueue.push(cb)
  }

  get(widgetConfig: WidgetConfig | WidgetConfig | string) {
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
    const widget = this.widgetsMap.get(widgetName)
    if (!widget) return null
    const { name, editorConfig, config, initPos } = widget.description

    return {
      name, editorConfig, config, pos: initPos || { x: 10, y: 10, w: 60, h: 60 }
    }
  }
}

export default WidgetsCenter
