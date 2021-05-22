import produce from 'immer'
import { Reducer } from 'redux'
import { RenderConfig, WidgetConfig } from '../render/interfaces'
import { WritableDraft } from 'immer/dist/internal'

export interface Pos { //画布位置坐标信息
  w: number,
  h: number,
  x: number,
  y: number
}

export interface BaseState {
  workplace: {
    renderConfig: RenderConfig, //全局最终配置
    selectedIndex: number[] | null
    canvas: { // 页面在画布中的位置坐标信息
      x: number,
      y: number,
      scale: number //缩放
      centerPosition: { x: number, y: number }
    },
    undoStack: BaseState[],
    redoStack: BaseState[]
  }
}

export enum Types {
  RenderConfig = "RenderConfig",
  SelectMultiple = "SelectMultiple",
  SelectOne = "SelectOne",
  AddItem = "AddItem",
  WidgetConfig = "WidgetConfig",
  DeleteItem = "DeleteItem",
  CopySelected = "CopySelected",
  ResetDraw = "ResetDraw",
  ChangeWorkingPos = "ChangeWorkingPos",
  Undo = "Undo",
  Redo = "Redo",
  MoveCanvasToCenter = "MoveCanvasToCenter",
  SetInitCanvasPos = "SetInitCanvasPos"
}

const AC = <T extends Types, P = null>(type: T, payload: P): { type: T, payload: P } => ({ type, payload })


export const EditorActions = {
  actSelect: (indexes: number[] | null) => AC(Types.SelectMultiple, indexes),
  actSelectOne: (idx: number | null) => AC(Types.SelectOne, idx),
  actRenderConfig: (config: RenderConfig) => AC(Types.RenderConfig, config),
  actAddItem: (config: WidgetConfig) => AC(Types.AddItem, config),
  actWidgetConfig: (config: WidgetConfig) => AC(Types.WidgetConfig, config),
  actDeleteItems: () => AC(Types.DeleteItem, null),
  actCopySelectedItems: () => AC(Types.CopySelected, null),
  actResetDraw: () => AC(Types.ResetDraw, null),
  actChangeWorkingPos: (pos: { x: number, y: number, scale: number }) => AC(Types.ChangeWorkingPos, pos),
  actUndo: () => AC(Types.Undo, null),
  actRedo: () => AC(Types.Redo, null),
  actMoveCanvasToCenter: () => AC(Types.MoveCanvasToCenter, null),
  actSetInitCanvasPos: (pos: { x: number, y: number }) => AC(Types.SetInitCanvasPos, pos)
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
      scale: 1,
      centerPosition: { x: 0, y: 0 }
    },
    undoStack: [],
    redoStack: [],
  }
}

const reducer: Reducer<BaseState, GetActionTypes<typeof EditorActions>> = (state = defaultBaseEditorState, action) => {
  const newState = produce(state, (state) => {
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
        const { centerPosition: { x, y } } = state.workplace.canvas
        state.workplace.canvas.x = x
        state.workplace.canvas.y = y
        break
      }
    }
  })

  switch (action.type) {
    case Types.Undo: {
      const _undoStack = [...newState.workplace.undoStack]

      const popState = _undoStack.pop()
      if (popState) {
        const _redoStack = [...newState.workplace.redoStack]
        _redoStack.push(popState)
        return {
          ...popState,
          undoStack: _undoStack,
          redoStack: _redoStack
        }
      } else {
        return newState
      }
    }
    case Types.Redo: {
      const _redoStack = [...newState.workplace.redoStack]

      const popState = _redoStack.pop()
      if (popState) {
        const _undoStack = [...newState.workplace.undoStack]
        _redoStack.push(popState)
        return {
          ...popState,
          undoStack: _undoStack,
          redoStack: _redoStack
        }
      } else {
        return newState
      }
    }
    default: {
      return produce(newState, it => {
        it.workplace.undoStack.push(newState)
      })
    }
  }
}

export default reducer
