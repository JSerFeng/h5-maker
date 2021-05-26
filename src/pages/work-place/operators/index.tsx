import { Tab, Tabs } from "@material-ui/core";
import { FC, useState } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import {  WidgetConfig } from "../../../render/interfaces";
import WidgetsCenter from "../../../render/WidgetsCenter";
import { BaseState } from "../../../store";
import CanvasConfig from "./canvasConfig";
import SingleConfig from "./SingleConfig";
import StyleConfig from "./StyleConfig"

const Operators: FC<{
  widgetsCenter: WidgetsCenter,
  currWidget: WidgetConfig[] | WidgetConfig | null,
  dispatch: Dispatch
}> = ({ dispatch, currWidget, widgetsCenter }) => {
  const [value, setValue] = useState(0)

  return (
    <div className="operators-list">
      <Tabs
        indicatorColor="primary"
        textColor="primary"
        scrollButtons="on"
        value={ value }
        onChange={ (_, value) => {
          setValue(value)
        } }
      >
        <Tab label="通用" />
        <Tab label="样式" />
      </Tabs>
      <div className="operators">
        {
          value === 0
            ? currWidget === null || currWidget === undefined
              ? <CanvasConfig />
              : Array.isArray(currWidget)
                ? null
                : currWidget.editorConfig === null
                  ? null
                  : <SingleConfig
                    dispatch={ dispatch }
                    CustomConfig={ widgetsCenter.get(currWidget)?.Configuration }
                    widgetConfig={ currWidget as WidgetConfig }
                  />
            : <StyleConfig
              widgetConfig={ currWidget }
              dispatch={ dispatch }
            />
        }
      </div>
    </div>
  )
}

export default connect(
  (state: BaseState) => {
    let currWidget: WidgetConfig | WidgetConfig[] | null = null
    const idxes = state.editorReducer.workplace.selectedIndex
    const widgets = state.editorReducer.workplace.renderConfig.widgets

    if (!idxes) {
      currWidget = null
    } else if (idxes.length > 1) {
      currWidget = idxes.map(i => widgets[i])
    } else if (idxes.length === 1) {
      currWidget = widgets[idxes[0]]
    } else {
      currWidget = null
    }
    return {
      currWidget
    }
  },
  dispatch => ({ dispatch })
)(Operators)
