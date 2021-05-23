import { FC, memo } from "react";
import { Dispatch } from "redux";
import { EditorActions } from "../../../store/editorReducer";

import { Button } from "@material-ui/core"
import { connect } from "react-redux";
import { BaseState } from "../../../store";

const { actResetDraw, actMoveCanvasToCenter } = EditorActions

const GeneralConfig: FC<{
  dispatch: Dispatch,
  workplace: BaseState["editorReducer"]["workplace"]
}> = ({ dispatch, workplace }) => {

  return (
    <div>
      <div>
        缩放 { workplace.canvas.scale * 100 }%
      </div>
      <Button color="secondary" variant="contained" onClick={ () => {
        dispatch(actMoveCanvasToCenter())
      } }>
        重置画布位置
      </Button>
      <Button color="secondary" variant="contained" onClick={ () => {
        dispatch(actResetDraw())
      } }>重置画布</Button>
    </div>
  )
}

export default connect(
  (state: BaseState) => ({
    workplace: state.editorReducer.workplace
  }),
  dispatch => ({ dispatch })
)(memo(GeneralConfig))
