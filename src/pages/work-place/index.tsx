import { FC, memo, useEffect, useState } from "react";
import Render from "../../render";
import Operators from "./operators";
import WidgetsList from "./WidgetsList";
import { WidgetConfig } from "../../render/interfaces";
import WidgetsCenter from "../../render/WidgetsCenter";

import "./style.scss"

const WorkPlace: FC<{
  widgetsCenter: WidgetsCenter
}> = ({ widgetsCenter }) => {
  const [allWidgetPkges, setAllWidgetPkges] = useState(widgetsCenter.getAll())
  const createWidgets = (config: WidgetConfig) => {
    const widgetDescription = widgetsCenter.get(config)
    return widgetDescription?.FC || null
  }
  useEffect(() => {
    widgetsCenter.subscribe(all => {
      setAllWidgetPkges(all)
    })
  }, [widgetsCenter])

  return (
    <div className="flex jb" style={ { height: "100vh" } }>
      <WidgetsList allWidgets={ allWidgetPkges } widgetsCenter={ widgetsCenter } />
      <Render createWidgets={ createWidgets } />
      <Operators widgetsCenter={ widgetsCenter } />
    </div>
  )
}

export default memo(WorkPlace)

