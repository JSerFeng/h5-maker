import { FC } from "react";
import { WidgetPackage } from "../../render/interfaces";

interface Props { }

const NotFound: FC<Props> = () => {
  return <div>组件未找到</div>
}

const widgetPackage: WidgetPackage = {
  FC: NotFound,
  description: {
    name: "not-found",
    showName: "404",
    version: "0.0.1",
    editorConfig: [],
    config: {}
  }
}

export default widgetPackage
