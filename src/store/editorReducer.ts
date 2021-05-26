import produce from 'immer'
import { Reducer } from 'redux'
import { RenderConfig, WidgetConfig } from '../render/interfaces'
import { WritableDraft } from 'immer/dist/internal'
import { deepCopy } from '../utils'


/**最大撤销步数 */
const UNDO_LIMIT = 20
export interface Pos { //画布位置坐标信息
  w: number,
  h: number,
  x: number,
  y: number
}


type MemoState = Pick<BaseState["workplace"], "renderConfig" | "selectedIndex" | "selectArea" | "selectedTool">
export interface BaseState {
  workplace: {
    renderConfig: RenderConfig, //全局最终配置
    selectedIndex: number[] | null
    canvas: { // 页面在画布中的位置坐标信息
      x: number,
      y: number,
      scale: number //缩放
      centerPosition: { x: number, y: number, scale: number }
    },
    selectArea: Pos,
    undoStack: MemoState[],
    redoStack: MemoState[],
    selectedTool: Tools | null,
    tmpPos: Pos[] /**暂存一些位置信息，用与多选在整体移动时，记住开始移动的位置 */
  }
}

export enum Types {
  RenderConfig = "RenderConfig",
  SelectMultiple = "SelectMultiple",
  SelectOne = "SelectOne",
  AddItem = "AddItem",
  WidgetConfig = "WidgetConfig",

  ChangeCanvasWH = "ChangeCanvasWH",

  StartWidgetChange = "StartWidgetChange",
  ChangeWidgetPos = "ChangeWidgetPos",
  CommitWidgetPosChange = "CommitWidgetPosChange",

  DeleteItem = "DeleteItem",
  CopySelected = "CopySelected",
  ResetDraw = "ResetDraw",
  ChangeWorkingPos = "ChangeWorkingPos",
  Undo = "Undo",
  Redo = "Redo",
  MoveCanvasToCenter = "MoveCanvasToCenter",
  SetInitCanvasPos = "SetInitCanvasPos",
  SelectTools = "SelectTools",
}

/**编辑器可选择工具 */
export enum Tools {
  Drag = "Drag",
  Select = "Select"
}

const AC = <T extends Types, P = null>(type: T, payload: P): { type: T, payload: P } => ({ type, payload })


export const EditorActions = {
  actSelect: (indexes: number[] | null) => AC(Types.SelectMultiple, indexes),
  actSelectOne: (idx: number | null) => AC(Types.SelectOne, idx),
  actChangeCanvasWH: (pos: {w: number, h: number}) => AC(Types.ChangeCanvasWH, pos),
  actAddItem: (config: WidgetConfig) => AC(Types.AddItem, config),
  actWidgetConfig: (config: WidgetConfig) => AC(Types.WidgetConfig, config),

  actStartWidgetPos: (initPos: Pos) => AC(Types.StartWidgetChange, initPos),
  actChangeWidgetPos: (deltaX: number, deltaY: number) => AC(Types.ChangeWidgetPos, { deltaX, deltaY }),
  actCommitChangeWidgetPos: (pos: Pos) => AC(Types.CommitWidgetPosChange, pos),

  actDeleteItems: () => AC(Types.DeleteItem, null),
  actCopySelectedItems: () => AC(Types.CopySelected, null),
  actResetDraw: () => AC(Types.ResetDraw, null),
  actChangeWorkingPos: (pos: { x: number, y: number, scale: number }) => AC(Types.ChangeWorkingPos, pos),
  actUndo: () => AC(Types.Undo, null),
  actRedo: () => AC(Types.Redo, null),
  actMoveCanvasToCenter: () => AC(Types.MoveCanvasToCenter, null),
  actSetInitCanvasPos: (pos: { x: number, y: number, scale: number }) => AC(Types.SetInitCanvasPos, pos),
  actSelectTool: (tool: Tools | null) => AC(Types.SelectTools, tool)
}

export type GetActionTypes<A extends { [k: string]: (...args: any[]) => { type: Types, payload: any } }> = { [K in keyof A]: ReturnType<A[K]> }[keyof A]


const defaultConfig: RenderConfig = {
  widgets: [],
  pos: { w: 400, h: 600 }
}

const defaultBaseEditorState: BaseState = {
  workplace: {
    renderConfig: defaultConfig,
    selectedIndex: null,
    canvas: {
      x: 0,
      y: 0,
      scale: 1.0,
      centerPosition: { x: 0, y: 0, scale: 1.0 },
    },
    selectArea: { x: 0, y: 0, w: 0, h: 0 },
    undoStack: [],
    redoStack: [],
    selectedTool: null,
    tmpPos: []
  }
}

const reducer: Reducer<BaseState, GetActionTypes<typeof EditorActions>> = produce((state = defaultBaseEditorState, action) => {
  /**检查是否需要存入撤销栈 */
  switch (action.type) {
    case Types.Undo: {
      const { renderConfig, selectArea, selectedIndex, selectedTool } = state.workplace
      const memoState = state.workplace.undoStack.pop()
      if (memoState) {
        state.workplace.renderConfig = memoState.renderConfig
        state.workplace.selectedIndex = memoState.selectedIndex
        state.workplace.selectedTool = memoState.selectedTool
        state.workplace.selectArea = memoState.selectArea
        state.workplace.redoStack.push(deepCopy({
          renderConfig, selectArea, selectedIndex, selectedTool
        }))
        if (state.workplace.undoStack.length > UNDO_LIMIT) {
          state.workplace.undoStack.shift()
        }
      }
      return
    }
    case Types.Redo: {
      const { renderConfig, selectArea, selectedIndex, selectedTool } = state.workplace
      const memoState = state.workplace.redoStack.pop()
      if (memoState) {
        state.workplace.renderConfig = memoState.renderConfig
        state.workplace.selectedIndex = memoState.selectedIndex
        state.workplace.selectedTool = memoState.selectedTool
        state.workplace.selectArea = memoState.selectArea

        state.workplace.undoStack.push(deepCopy({
          renderConfig, selectArea, selectedIndex, selectedTool
        }))
      }
      return
    }
    /**需要存状态的情况 */
    case Types.CopySelected:
    case Types.AddItem:
    case Types.DeleteItem:
    case Types.ResetDraw:
    case Types.WidgetConfig:
    case Types.StartWidgetChange:
    case Types.CommitWidgetPosChange:
      const { renderConfig, selectArea, selectedIndex, selectedTool } = state.workplace
      state.workplace.undoStack.push(deepCopy({
        renderConfig, selectArea, selectedIndex, selectedTool
      }))
      if (state.workplace.redoStack.length) {
        state.workplace.redoStack.length = 0
        state.workplace.redoStack = []
      }
  }

  switch (action.type) {
    case Types.SelectOne: {
      const idx = action.payload
      if (idx !== null) {
        if (
          state.workplace.selectedIndex?.length === 1 &&
          state.workplace.selectedIndex[0] === idx
        ) {
          return
        }
        state.workplace.selectedIndex = [idx]
      } else {
        state.workplace.selectedIndex = null
      }
      break
    }
    case Types.SelectMultiple: {
      const idxes = action.payload
      if (idxes) {
        state.workplace.selectedIndex = idxes
      } else {
        state.workplace.selectedIndex = null
      }
      break
    }
    case Types.WidgetConfig: {
      const indexes = state.workplace.selectedIndex
      if (!indexes || indexes.length !== 1) return
      const idx = indexes[0]
      state.workplace.renderConfig.widgets[idx] = action.payload as WritableDraft<WidgetConfig>
      break
    }
    case Types.ChangeCanvasWH: {
      state.workplace.renderConfig.pos = action.payload
      break
    }
    case Types.StartWidgetChange: {
      state.workplace.selectArea = action.payload
      state.workplace.tmpPos = state.workplace.renderConfig.widgets.map(
        item => item.pos
      )
      break
    }
    case Types.ChangeWidgetPos: {
      const { deltaX, deltaY } = action.payload
      const { tmpPos, renderConfig: { widgets }, selectedIndex } = state.workplace
      if (selectedIndex) {
        for (const index of selectedIndex) {
          widgets[index].pos.x = tmpPos[index].x + deltaX
          widgets[index].pos.y = tmpPos[index].y + deltaY
        }
      }
      break
    }
    case Types.CommitWidgetPosChange: {
      state.workplace.selectArea = action.payload
      break
    }
    case Types.AddItem: {
      state.workplace.renderConfig.widgets.push(action.payload as WritableDraft<WidgetConfig>)
      break
    }
    case Types.DeleteItem: {
      let indexes: number[] | null
      if ((indexes = state.workplace.selectedIndex)) {
        indexes.sort((a, b) => b - a)
        indexes.forEach(idx => {
          state.workplace.renderConfig.widgets.splice(idx, 1)
        });
      }
      break
    }
    case Types.CopySelected: {
      let indexes: number[] | null
      if ((indexes = state.workplace.selectedIndex)) {
        indexes.forEach((idx) => {
          const widgets = state.workplace.renderConfig.widgets
          const widget = widgets[idx]
          if (widget) {
            widgets.push(widget)
          }
        })
      }
      break
    }
    case Types.ResetDraw: {
      state.workplace.selectedIndex = null
      state.workplace.renderConfig.widgets.length = 0
      state.workplace.renderConfig.widgets = []
      break
    }
    case Types.ChangeWorkingPos: {
      const { x, y, scale } = action.payload
      state.workplace.canvas.x = x
      state.workplace.canvas.y = y
      state.workplace.canvas.scale = scale
      break
    }
    case Types.SetInitCanvasPos: {
      state.workplace.canvas.centerPosition = action.payload
      break
    }
    case Types.MoveCanvasToCenter: {
      const { centerPosition: { x, y, scale } } = state.workplace.canvas
      state.workplace.canvas.x = x
      state.workplace.canvas.y = y
      state.workplace.canvas.scale = scale
      break
    }
    case Types.SelectTools: {
      state.workplace.selectedTool = action.payload
      break
    }
  }

}, defaultBaseEditorState)

export default reducer
