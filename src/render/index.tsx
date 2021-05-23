import { ComponentClass, FC, useEffect, useRef, useState } from 'react';
import RenderWidget from './RenderWidget';
import { connect } from 'react-redux';
import { BaseState } from '../store';
import { Dispatch } from "redux"
import { fromEvent } from 'rxjs';
import {
  tap,
  filter,
  switchMapTo,
  switchMap,
  takeUntil,
  map,
  throttleTime
} from 'rxjs/operators';
import { EditorActions, Tools } from '../store/editorReducer';
import { WidgetConfig, WidgetProps } from './interfaces';
import produce from 'immer';

import "./style.scss"
import EventEmitter from '../utils/eventEmitter';

const {
  actSelect,
  actDeleteItems,
  actChangeWorkingPos,
  actCopySelectedItems, actSetInitCanvasPos,
  actUndo,
  actRedo,
  actChangeWidgetPos,
  actStartWidgetPos,
  actCommitChangeWidgetPos
} = EditorActions

const mouseMove$ = fromEvent(document, "mousemove")
const mouseUp$ = fromEvent(document, "mouseup")
const keyDown$ = fromEvent(window, "keydown").pipe(
  /**@TODO delete */
  tap(e => console.log((e as KeyboardEvent).key))
)
const keyUp$ = fromEvent(window, "keyup")
const keyZ$ = keyDown$.pipe(filter(e => (e as KeyboardEvent).key.toUpperCase() === "Z"))
let shiftOn = false
const shift$ = keyDown$.pipe(
  filter(e => (e as KeyboardEvent).key === "Shift"),
)
const shiftUp$ = keyUp$.pipe(
  filter(e => (e as KeyboardEvent).key === "Shift"),
)
const mouseWheel$ = fromEvent(window, "mousewheel")
const cmd$ = keyDown$.pipe(filter(e => (e as KeyboardEvent).key === "Control"))
const cmdUp$ = keyUp$.pipe(filter(e => (e as KeyboardEvent).key === "Control"))
const alt$ = keyDown$.pipe(filter(e => (e as KeyboardEvent).key === "Alt"))

const initStyle = {
  left: "50%",
  top: "50%",
  width: "100%",
  height: "100%",
  transform: "translate(-50%, -50%)"
}

const Renderer: FC<{
  workplace: BaseState["editorReducer"]["workplace"],
  dispatch: Dispatch,
  createWidgets: (config: WidgetConfig) => FC<WidgetProps> | ComponentClass<WidgetProps> | null,
  eventPool: EventEmitter
}> = (props) => {
  const container = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const { workplace, dispatch, createWidgets, eventPool } = props
  const { canvas, renderConfig } = workplace
  const { pos, widgets } = renderConfig
  const { w, h } = pos

  const [refLines, setRefLines] = useState<[number, number, number][]>([])
  const [canvasPos, setCanvasPos] = useState(canvas)
  const [selectArea, setSelectArea] = useState({ x: 0, y: 0, w: 0, h: 0 })
  /**这里必须用一个mutable的变量存，否则一边话useEffect就重新执行 */
  const initPos = useRef({ ...selectArea })

  const multiSelectRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<HTMLDivElement>(null)

  /**处理撤销和回退 */
  useEffect(() => {
    const subShiftUp = shiftUp$.subscribe(() => {
      shiftOn = false
    })
    const subShiftDown = shift$.subscribe(() => {
      shiftOn = true
    })
    const subUndo = cmd$.pipe(
      switchMapTo(keyZ$.pipe(
        takeUntil(cmdUp$),
      )),
      filter(() => !shiftOn)
    ).subscribe(() => {
      console.log("undo");
      dispatch(actUndo())
    })

    const subRedo = cmd$.pipe(
      switchMapTo(shift$),
      switchMapTo(keyZ$.pipe(
        takeUntil(cmdUp$)
      )),
      filter(() => shiftOn),
    ).subscribe(() => {
      console.log("redo");
      dispatch(actRedo())
    })

    return () => {
      subShiftDown.unsubscribe()
      subShiftUp.unsubscribe()
      subUndo.unsubscribe()
      subRedo.unsubscribe()
    }
  }, [dispatch])

  /**初始化让画布处于正中间位置 */
  useEffect(() => {
    const { offsetWidth, offsetHeight } = container.current!.offsetParent as HTMLDivElement
    const x = offsetWidth / 2 - w / 2
    const y = offsetHeight / 2 - h / 2
    const initPos = {
      x,
      y,
      scale: 1,
      centerPosition: { x, y, scale: 1 }
    }
    dispatch(actSetInitCanvasPos(initPos))
    dispatch(actChangeWorkingPos(initPos))
    setCanvasPos(initPos)
  }, [dispatch, h, w])

  /**处理背景移动，删除，拷贝，多选 */
  useEffect(() => {
    const currCanvasPos = { ...canvas }

    const _container = container.current!
    const bgMouseDown$ = fromEvent(bgRef.current!, "mousedown")
    const multiSelectStart$ = fromEvent(multiSelectRef.current!, "mousedown").pipe(
      tap(e => { e.stopPropagation() })
    )

    const mouseDown$ = fromEvent(_container, "mousedown").pipe(
      tap(e => e.stopPropagation())
    )
    const mouseUp$ = fromEvent(document, "mouseup").pipe(
      tap(() => {
        dispatch(actChangeWorkingPos(currCanvasPos))
      })
    )

    const subDeleteItem = keyDown$.pipe(
      filter(e => (e as KeyboardEvent).key === "Delete")
    ).subscribe(() => {
      dispatch(actDeleteItems())
    })

    const subBgResize = alt$.pipe(
      switchMapTo(mouseWheel$.pipe(
        map(e => (e as WheelEvent).deltaY > 0),
        takeUntil(keyUp$)
      ))
    ).subscribe(isSmaller => {
      setCanvasPos(pos => produce(pos, it => {
        it.scale = Math.max(0.1, isSmaller ? it.scale - 0.1 : it.scale + 0.1)
      }))
      currCanvasPos.scale = Math.max(
        0.1,
        isSmaller ? currCanvasPos.scale - 0.1 : currCanvasPos.scale + 0.1
      )

      dispatch(actChangeWorkingPos(currCanvasPos))
    })

    const subCopy = cmd$.pipe(
      switchMapTo(keyDown$.pipe(
        filter(e => (e as KeyboardEvent).key.toLowerCase() === "c"),
      ))
    ).subscribe(() => {
      dispatch(actCopySelectedItems())
    })

    const selectMain = mouseDown$
      .subscribe(() => {
        dispatch(actSelect(null))
      })

    const subBgMove = bgMouseDown$.pipe(
      switchMap(e => {
        const initX = (e as MouseEvent).pageX
        const initY = (e as MouseEvent).pageY

        return mouseMove$.pipe(
          map((e) => {
            const x = (e as MouseEvent).pageX - initX
            const y = (e as MouseEvent).pageY - initY
            return { x, y, initX, initY }
          }),
          takeUntil(mouseUp$)
        )
      })
    ).subscribe((pos) => {
      dispatch(actSelect(null))
      const nextX = canvas.x + pos.x
      const nextY = canvas.y + pos.y
      currCanvasPos.x = nextX
      currCanvasPos.y = nextY
      setCanvasPos((prev) => ({
        ...prev, x: nextX, y: nextY
      }))
    })

    /**拖动多选 */
    const subMultiSelect = multiSelectStart$.pipe(
      switchMap(e => {
        /**点击其他地方会让选中区域消失 */
        setSelectArea({ x: 0, y: 0, w: 0, h: 0 })

        const initX = (e as MouseEvent).pageX
        const initY = (e as MouseEvent).pageY
        const containerOffsetLeft = container.current!.offsetLeft + bgRef.current!.offsetLeft
        const containerOffsetTop = container.current!.offsetTop + bgRef.current!.offsetTop

        return mouseMove$.pipe(
          map(e => {
            const x = (e as MouseEvent).pageX
            const y = (e as MouseEvent).pageY
            const left = (x < initX ? x : initX) - containerOffsetLeft
            const top = (y < initY ? y : initY) - containerOffsetTop
            const w = Math.abs(x - initX)
            const h = Math.abs(y - initY)
            return { x: left, y: top, w, h }
          }),
          takeUntil(mouseUp$)
        )
      })
    ).subscribe(areaPos => {
      const selectedIdxes = widgets
        .map(({ pos: { x, y, w, h } }, i) => {
          /**判断四个点是否有一个在areaPos钟 */
          if (x > areaPos.x && x < areaPos.x + areaPos.w &&
            y > areaPos.y && y < areaPos.y + areaPos.h
          ) {
            return i
          }
          if (x + w > areaPos.x && x + w < areaPos.x + areaPos.w &&
            y > areaPos.y && y < areaPos.y + areaPos.h
          ) {
            return i
          }
          if (x > areaPos.x && x < areaPos.x + areaPos.w &&
            y + h > areaPos.y && y + h < areaPos.y + areaPos.h
          ) {
            return i
          }
          if (x + w > areaPos.x && x + w < areaPos.x + areaPos.w &&
            y + h > areaPos.y && y + h < areaPos.y + areaPos.h
          ) {
            return i
          }
          return -1
        })
        .filter(idx => idx !== -1)
      dispatch(actSelect(selectedIdxes.length ? selectedIdxes : null))
      setSelectArea(areaPos)
      initPos.current = areaPos
    })

    return () => {
      selectMain.unsubscribe()
      subCopy.unsubscribe()
      subDeleteItem.unsubscribe()
      subBgMove.unsubscribe()
      subBgResize.unsubscribe()
      subMultiSelect.unsubscribe()
    }
  }, [canvas, dispatch, widgets])

  /**让画布随着redux改变 */
  useEffect(() => {
    const { x, y } = canvas
    setCanvasPos(prev => ({ ...prev, x, y }))
  }, [canvas])

  useEffect(() => {
    const pos = workplace.selectArea
    setSelectArea(pos)
    initPos.current = { ...pos }
  }, [workplace.selectArea])

  /**处理多选整体移动 */
  useEffect(() => {
    const selectedAreaMouseDown$ = fromEvent(selectedRef.current!, "mousedown").pipe(
      tap(e => e.stopPropagation())
    )
    let deltaX = 0
    let deltaY = 0
    const subSelectedAreaMove = selectedAreaMouseDown$.pipe(
      switchMap(e => {
        const startX = (e as MouseEvent).pageX
        const startY = (e as MouseEvent).pageY
        dispatch(actStartWidgetPos({ ...initPos.current }))
        return mouseMove$.pipe(
          map(e => {
            deltaX = (e as MouseEvent).pageX - startX
            deltaY = (e as MouseEvent).pageY - startY
            return { deltaX, deltaY }
          }),
          takeUntil(mouseUp$.pipe(
            tap(() => {
              initPos.current.x = initPos.current.x + deltaX
              initPos.current.y = initPos.current.y + deltaY
              dispatch(actCommitChangeWidgetPos({ ...initPos.current }))
            })
          ))
        )
      }),
      throttleTime(12)
    ).subscribe(({ deltaX, deltaY }) => {
      if (workplace.selectedIndex) {
        dispatch(actChangeWidgetPos(deltaX, deltaY))
      }
      setSelectArea(pos => produce(pos, it => {
        it.x = initPos.current.x + deltaX
        it.y = initPos.current.y + deltaY
      }))
    })
    return () => {
      subSelectedAreaMove.unsubscribe()
    }
  }, [dispatch, workplace.selectedIndex])

  /**松开按下工具键要让选中区域消失 */
  useEffect(() => {
    setSelectArea({ x: 0, y: 0, w: 0, h: 0 })
    dispatch(actSelect(null))
  }, [dispatch, workplace.selectedTool])

  return (
    <div className="work-bg relative" ref={ bgRef }>
      <div
        ref={ container }
        className="display-view absolute"
        style={ canvasPos.centerPosition.x ? {
          width: w + "px",
          height: h + "px",
          transform: `scale(${canvasPos.scale})`,
          left: canvasPos.x + "px",
          top: canvasPos.y + "px"
        } : initStyle }
      >
        {
          widgets.map((item, i) => (
            <RenderWidget
              key={ i }
              selected={
                (workplace.selectedIndex && workplace.selectedIndex.indexOf(i) !== -1) ||
                false
              }
              widgetConfig={ item }
              idx={ i }
              container={ container }
              setRefLines={ setRefLines }
              createWidgets={ createWidgets }
              eventPool={ eventPool }
            />
          ))
        }
        {
          refLines.map(([isCol, pos, isSelectOne], i) => (
            <div
              key={ i }
              {
              ...(isCol ?
                {
                  className: "ref-line-col",
                  style: {
                    left: pos + "px",
                    background: isSelectOne ? "red" : "blue"
                  }
                } : {
                  className: "ref-line-row",
                  style: {
                    top: pos + "px",
                    background: isSelectOne ? "red" : "blue"
                  }
                })
              }
            ></div>
          ))
        }
        <div
          className={
            workplace.selectedTool === Tools.Select ? "absolute select-mask cursor" : "hidden"
          }
          ref={ multiSelectRef }>
        </div>
        <div
          ref={ selectedRef }
          className={ workplace.selectedTool === Tools.Select ? "selected-area absolute" : "hidden" }
          style={ {
            left: selectArea.x,
            top: selectArea.y,
            width: selectArea.w,
            height: selectArea.h
          } }
        >
        </div>
        <div className={
          workplace.selectedTool === Tools.Drag ? "absolute drag-mask cursor" : "hidden"
        }></div>
      </div>
    </div >
  )
}

export default connect(
  (state: BaseState) => ({
    workplace: state.editorReducer.workplace
  }),
  dispatch => ({ dispatch })
)(Renderer)

