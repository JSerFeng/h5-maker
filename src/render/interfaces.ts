import { ComponentClass, CSSProperties, FC } from "react";

export enum EditorTypes {
  Color = "Color",
  Upload = "Upload",
  Text = "Text",
  Number = "Number",
}

export type ReactComp<T> = FC<T> | ComponentClass<T>

export interface Pos {
  x: number, y: number, w: number, h: number
}

export interface EditorConfig {
  key: string,
  name: string,
  type: EditorTypes
}
export interface WidgetConfig {
  name: string,
  editorConfig: EditorConfig[],
  config: { [k: string]: any },
  pos: Pos, //位置信息
  style?: Partial<CSSProperties>, //样式信息
}

export interface RenderConfig {
  widgets: WidgetConfig[],
  pos: { w: number, h: number } //页面大小，在工作台中位置
}

export interface WidgetDescription {
  name: string,
  version: string,
  editorConfig: EditorConfig[],
  config: { [k: string]: any },
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

export interface WidgetPackage {
  FC: ReactComp<WidgetProps>,
  description: WidgetDescription
}

