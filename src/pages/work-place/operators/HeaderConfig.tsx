import { FC } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { EditorActions, Tools } from "../../../store/editorReducer";
import { Undo, Redo, PanTool, NearMe } from '@material-ui/icons';
import { BaseState } from "../../../store";
import { Button, Tooltip } from "@material-ui/core";
import { apiGenCode } from "../../../api/generateCode";

const { actUndo, actRedo, actSelectTool } = EditorActions

const tools = [
  { Icon: NearMe, type: Tools.Select, title: "选择" },
  { Icon: PanTool, type: Tools.Drag, title: "移动画布" },
]

const HeaderConfig: FC<{
  dispatch: Dispatch,
  workPlace: BaseState["editorReducer"]["workplace"]
}> = ({ dispatch, workPlace }) => {
  const generateCode = () => {
    apiGenCode(workPlace.renderConfig)
  }

  return (
    <header className="header-config pointer flex ac jb">
      <div className="tools flex ac">
        {
          tools.map(({ Icon, type, title }) => {
            return <Tooltip key={ type } placement="bottom" title={ title } color="blue">
              <div
                className={
                  "tool-item flex jc ac " + (workPlace.selectedTool === type
                    ? "active" : "")
                }
                onClick={ () => {
                  dispatch(actSelectTool(
                    workPlace.selectedTool === type ? null : type
                  ))
                } }
              >
                <Icon />
              </div>
            </Tooltip>
          })
        }
        <div className="tool-item flex jc ac "><Undo onClick={ dispatch.bind(null, actUndo()) } /></div>
        <div className="tool-item flex jc ac "><Redo onClick={ dispatch.bind(null, actRedo()) } /></div>
      </div>

      <div>
        <Button
          color="primary"
          variant="contained"
          onClick={ generateCode }
        >生成源代码</Button>
        <Button variant="outlined" color="primary">导出JSON</Button>
      </div>
    </header>
  )
}

export default connect(
  (state: BaseState) => ({
    workPlace: state.editorReducer.workplace
  })
)(HeaderConfig)
