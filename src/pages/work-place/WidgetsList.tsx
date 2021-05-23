import { notification, Tooltip } from "antd"
import { FC } from "react"
import { connect } from "react-redux"
import { Dispatch } from "redux"
import { WidgetPackage } from "../../render/interfaces"
import WidgetsCenter from "../../render/WidgetsCenter"
import { BaseState } from "../../store"
import { EditorActions } from "../../store/editorReducer"

const { actAddItem } = EditorActions

const WidgetsList: FC<{
  widgetsCenter: WidgetsCenter,
  dispatch: Dispatch,
  allWidgets: WidgetPackage[]
}> = ({ widgetsCenter, dispatch, allWidgets }) => {
  const addWidget = (name: string) => {
    const widgetConfig = widgetsCenter.create(name)
    if (widgetConfig) {
      dispatch(actAddItem(widgetConfig))
    } else {
      notification.info({
        message: "未知错误，没有找到组件"
      })
    }
  }
  return (
    <div className="widgets">
      <div className="widgets-list">
        <div>组件列表</div>
        {
          allWidgets.map(({ description }, i) => (
            <Tooltip key={ i } title={ description.description } color="blue">
              <div className="widgets-list-item" onClick={ addWidget.bind(null, description.name) }>
                <img src={ description.snapShot } alt={ description.name } />
                <div>{ description.name }</div>
              </div>
            </Tooltip>
          ))
        }
      </div>
    </div>
  )
}

export default connect(
  (state: BaseState) => ({}),
  dispatch => ({ dispatch })
)(WidgetsList)
