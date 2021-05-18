import { FC } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { WidgetConfig } from "../../../render/interfaces";
import WidgetsCenter from "../../../render/WidgetsCenter";
import { BaseState } from "../../../store";
import GeneralConfig from "./GeneralConfig";
import SingleConfig from "./SingleConfig";

const Operators: FC<{
  widgetsCenter: WidgetsCenter,
  currWidget: WidgetConfig[] | WidgetConfig | null,
  dispatch: Dispatch
}> = ({ dispatch, currWidget }) => {
  console.log(currWidget);
  

  return <div className="operators">
    {
      currWidget === null || currWidget === undefined
        ? <GeneralConfig />
        : Array.isArray(currWidget)
          ? null
          : <SingleConfig dispatch={dispatch} widgetConfig={ currWidget } />
    }
  </div>
}

export default connect(
  (state: BaseState) => {
    let currWidget: WidgetConfig | WidgetConfig[] | null = null
    const idxes = state.editorReducer.workplace.selectedIndex
    const widgets = state.editorReducer.workplace.renderConfig.widgets
    console.log(idxes);
    
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
