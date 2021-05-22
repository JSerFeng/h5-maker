import { EditorTypes, WidgetPackage } from "../../render/interfaces";
import Rectangle from "./rectangle";

const pkg: WidgetPackage = {
  FC: Rectangle,
  description: {
    name: "矩形和圆形",
    version: "0.0.1",
    description: "基础的矩形，调整圆角可以呈现其他形状",
    editorConfig: [
      {
        key: "backgroundColor",
        name: "颜色",
        type: EditorTypes.Color
      }, {
        key: "borderRadius",
        name: "圆角",
        type: EditorTypes.Number
      }
    ],
    config: {
      backgroundColor: "blue"
    }
  }
}

export default pkg
