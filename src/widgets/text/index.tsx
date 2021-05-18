import { FC } from "react"
import { EditorTypes, Pos, WidgetPackage } from "../../render/interfaces"

interface TextProps {
  config: {
    fontSize: number,
    color: string,
    padding: number,
    content: string,
  },
  pos: Pos
}

const Text: FC<TextProps> = (props) => {
  const { fontSize, color, padding, content } = props.config
  const { w, h } = props.pos

  return <div style={ {
    fontSize, color,
    padding: padding + "px",
    width: w,
    height: h,
    display: "flex",
    alignItems: "center"
  } }>
    <div> { content }</div>
  </div>
}

const widgetPkg: WidgetPackage = {
  FC: Text,
  description: {
    name: "text",
    version: "0.0.1",
    description: "基础文本控件",
    editorConfig: [
      {
        key: "onClick",
        name: "点击后的回调",
        type: EditorTypes.Text
      },
      {
        key: "fontSize",
        name: "字体大小",
        type: EditorTypes.Number,
      }, {
        key: "color",
        name: "字体颜色",
        type: EditorTypes.Color
      }, {
        key: "padding",
        name: "内边距",
        type: EditorTypes.Number
      }, {
        key: "content",
        name: "内容",
        type: EditorTypes.Text
      }
    ],
    config: {
      fontSize: 16,
      color: "black",
      padding: 15,
      content: "文本框",
      onClick: "console"
    }
  }
}

export default widgetPkg