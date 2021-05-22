import { FC, memo } from "react";
import { Dispatch } from "redux";
import { EditorActions } from "../../../store/editorReducer";

import { Button } from "@material-ui/core"

const { actResetDraw, actMoveCanvasToCenter } = EditorActions

const GeneralConfig: FC<{
  dispatch: Dispatch,
}> = ({ dispatch }) => {

  return (
    <div>
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

export default memo(GeneralConfig)
