import { FC, memo, useEffect, useState } from "react";
import Render from "../../render";
import Operators from "./operators";
import WidgetsList from "./WidgetsList";
import { WidgetConfig } from "../../render/interfaces";
import WidgetsCenter from "../../render/WidgetsCenter";
import HeaderConfig from "./operators/HeaderConfig";
import EventEmitter from "../../utils/eventEmitter"

import "./style.scss"

const eventPool = new EventEmitter()

const WorkPlace: FC<{
  widgetsCenter: WidgetsCenter
}> = ({ widgetsCenter }) => {
  const [allWidgetPkges, setAllWidgetPkges] = useState(widgetsCenter.getAll())
  const createWidgets = (config: WidgetConfig | string) => {
    if (typeof config === "string") {
      const pkg = widgetsCenter.get(config)
      if (pkg) {
        return pkg.FC
      } else {
        return null
      }
    }
    const widgetDescription = widgetsCenter.get(config)
    return widgetDescription?.FC || null
  }
  useEffect(() => {
    widgetsCenter.subscribe(all => {
      setAllWidgetPkges(all)
    })
  }, [widgetsCenter])

  return (
    <div>
      <HeaderConfig />
      <div className="flex jb" style={ { height: "90vh" } }>
        <WidgetsList allWidgets={ allWidgetPkges } widgetsCenter={ widgetsCenter } />
        <Render widgetsCenter={ widgetsCenter } eventPool={ eventPool } createWidgets={ createWidgets } />
        <Operators widgetsCenter={ widgetsCenter } />
      </div>
    </div>
  )
}

export default memo(WorkPlace)

