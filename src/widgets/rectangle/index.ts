import { EditorTypes, WidgetPackage } from "../../render/interfaces";
import Rectangle from "./rectangle";

const pkg: WidgetPackage = {
  FC: Rectangle,
  description: {
    name: "矩形",
    version: "0.0.1",
    editorConfig: [
      {
        key: "backgroundColor",
        name: "颜色",
        type: EditorTypes.Color
      }
    ],
    config: {
      backgroundColor: "blue"
    }
  }
}

export default pkg
