export enum EditorTypes {
  Color = "Color",
  Upload = "Upload",
  Text = "Text",
  Number = "Number",
  Select = "Select"
}

export type EditorConfig<T extends EditorTypes = EditorTypes> =
  T extends EditorTypes.Number | EditorTypes.Text | EditorTypes.Color
  ? {
    key: string,
    name: string,
    type: T,
  }
  : {
    key: string,
    name: string,
    type: T,
    options: T extends EditorTypes.Select
/* */ ? { label: string, value: string }[]
/* */ : T extends EditorTypes.Upload
/*   */ ? Record<string, any>
/*   */ : never
  }


export interface Pos {
  x: number, y: number, w: number, h: number
}

export interface WidgetConfig<T extends EditorConfig[] | null = EditorConfig[] | null> {
  name: string,
  editorConfig: T,
  config: TransformConfig<T>,
  pos: Pos, //位置信息
  style?: Record<string, string>, //样式信息
  version?: string
}

export interface RenderConfig {
  widgets: WidgetConfig<EditorConfig[] | null>[],
  pos: { w: number, h: number }, //页面大小，在工作台中位置
  projectName: string
}

export interface WidgetDescription {
  name: string,
  version: string,
  editorConfig: EditorConfig[],
  config: {},
  initPos?: Pos,
  style?: Record<string, string>,
  snapShot?: string,
  description?: string,
}

export interface WidgetProps {
  config: any,
  pos: Pos,
  style?: Record<string, string>
}


export interface WidgetConfigProp {
  widgetConfig: WidgetConfig,
  dispatchConfig: (widgetConfig: WidgetConfig) => void
}



export type TransformConfig<T> = T extends Array<infer Item>
/**/ ? Item extends { key: infer Key }
/****/ ? Key extends string
/******/ ? { [P in Key]: any }
/******/ : {}
/****/ : {}
/**/ : T

