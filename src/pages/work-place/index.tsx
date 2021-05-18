import { FC, useEffect, useState } from "react";
import { connect } from "react-redux";
import Render from "../../render";
import widgetsCenter from "../../widgets";
import { BaseState } from "../../store";
import Operators from "./operators";
import WidgetsList from "./WidgetsList";

import "./style.scss"
import { WidgetConfig, WidgetPackage } from "../../render/interfaces";

const WorkPlace: FC = () => {
  const [allWidgetPkges, setAllWidgetPkges] = useState<WidgetPackage[]>(widgetsCenter.getAll())
  const createWidgets = (config: WidgetConfig) => {
    const widgetDescription = widgetsCenter.get(config)
    return widgetDescription?.FC || null
  }
  useEffect(() => {
    widgetsCenter.subscribe(all => {
      setAllWidgetPkges(all)
    })
  }, [])


  return (
    <div className="flex jb" style={ { height: "100vh" } }>
      <WidgetsList allWidgets={ allWidgetPkges } widgetsCenter={ widgetsCenter } />
      <Render createWidgets={ createWidgets } />
      <Operators widgetsCenter={ widgetsCenter } />
    </div>
  )
}

export default connect(
  (state: BaseState) => ({})
)(WorkPlace)

