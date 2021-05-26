import { FC, memo } from "react";
import { Dispatch } from "redux";
import { EditorActions } from "../../../store/editorReducer";

import { Button, Input } from "@material-ui/core"
import { connect } from "react-redux";
import { BaseState } from "../../../store";
import produce from "immer";

const {
  actResetDraw,
  actMoveCanvasToCenter,
  actChangeCanvasWH
} = EditorActions

const GeneralConfig: FC<{
  dispatch: Dispatch,
  workplace: BaseState["editorReducer"]["workplace"]
}> = ({ dispatch, workplace }) => {

  return (
    <div>
      <div>
        网页宽度
        <Input value={ workplace.renderConfig.pos.w } onChange={ (e) => {
          dispatch(actChangeCanvasWH(produce(workplace.renderConfig.pos, it => {
            let val: number
            if ((val = Number(e.target.value))) {
              it.w = Number(val)
            }
          })))
        } } />
      </div>
      <div>
        网页高度
        <Input value={ workplace.renderConfig.pos.h } onChange={ (e) => {
          dispatch(actChangeCanvasWH(produce(workplace.renderConfig.pos, it => {
            let val: number
            if ((val = Number(e.target.value))) {
              it.h = val
            }
          })))
        } } />

      </div>
      <div>
        缩放 { (workplace.canvas.scale * 100).toFixed(0) }%
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
