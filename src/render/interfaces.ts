import { ComponentClass, CSSProperties, FC } from "react";

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

export type ReactComp<T> = FC<T> | ComponentClass<T>

export interface Pos {
  x: number, y: number, w: number, h: number
}

export interface WidgetConfig<T extends EditorConfig[] | null = EditorConfig[] | null> {
  name: string,
  editorConfig: T,
  config: TransformConfig<T>,
  pos: Pos, //位置信息
  style?: Partial<CSSProperties>, //样式信息
}

export interface RenderConfig {
  widgets: WidgetConfig<EditorConfig[] | null>[],
  pos: { w: number, h: number } //页面大小，在工作台中位置
}

export interface WidgetDescription {
  name: string,
  version: string,
  editorConfig: EditorConfig[],
  config: {},
  initPos?: Pos,
  style?: Partial<CSSProperties>,
  snapShot?: string,
  description?: string,
}

export interface WidgetProps {
  config: any,
  pos: Pos,
  style?: Partial<CSSProperties>
}


export interface WidgetConfigProp {
  widgetConfig: WidgetConfig,
  dispatchConfig: (widgetConfig: WidgetConfig) => void
}

export interface WidgetPackage {
  FC: ReactComp<WidgetProps>,
  description: WidgetDescription
  Configuration?: ReactComp<WidgetConfigProp>,
}


export type TransformConfig<T> = T extends Array<infer Item>
/**/ ? Item extends { key: infer Key }
/****/ ? Key extends string
/******/ ? { [P in Key]: any }
/******/ : {}
/****/ : {}
/**/ : T

