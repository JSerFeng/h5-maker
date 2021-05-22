import { ComponentClass, FC, useEffect, useRef, useState } from 'react';
import RenderWidget from './RenderWidget';
import { connect } from 'react-redux';
import { BaseState } from '../store';
import { Dispatch } from "redux"
import { fromEvent } from 'rxjs';
import { tap, filter, switchMapTo, switchMap, takeUntil, map } from 'rxjs/operators';
import { EditorActions } from '../store/editorReducer';

import "./style.scss"
import { WidgetConfig, WidgetProps } from './interfaces';
import produce from 'immer';

const { actSelect, actDeleteItems, actChangeWorkingPos, actCopySelectedItems, actSetInitCanvasPos, actUndo, actRedo } = EditorActions

const Renderer: FC<{
  workplace: BaseState["editorReducer"]["workplace"],
  dispatch: Dispatch,
  createWidgets: (config: WidgetConfig) => FC<WidgetProps> | ComponentClass<WidgetProps> | null
}> = (props) => {
  const container = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const { workplace, dispatch, createWidgets } = props
  const { canvas, renderConfig } = workplace
  const { pos, widgets } = renderConfig
  const { w, h } = pos
  const [refLines, setRefLines] = useState<[number, number, number][]>([])
  const [canvasPos, setCanvasPos] = useState(canvas)

  /**初始化让画布处于正中间位置 */
  useEffect(() => {
    const { offsetWidth, offsetHeight } = container.current!.offsetParent as HTMLDivElement
    const x = offsetWidth / 2 - w / 2
    const y = offsetHeight / 2 - h / 2
    const initPos = {
      x,
      y,
      scale: 1,
      centerPosition: { x, y }
    }
    dispatch(actChangeWorkingPos(initPos))
    dispatch(actSetInitCanvasPos(initPos))
    setCanvasPos(initPos)
  }, [dispatch, h, w])

  useEffect(() => {
    const currCanvasPose = { ...canvas }

    const _container = container.current!
    const bgMouseDown$ = fromEvent(bgRef.current!, "mousedown")
    const mouseDown$ = fromEvent(_container, "mousedown").pipe(
      tap(e => e.stopPropagation())
    )
    const mouseMove$ = fromEvent(document, "mousemove")
    const mouseUp$ = fromEvent(document, "mouseup").pipe(
      tap(() => {
        dispatch(actChangeWorkingPos(currCanvasPose))
      })
    )
    const keyDown$ = fromEvent(document, "keydown").pipe(
      tap(e => console.log((e as KeyboardEvent).key))
    )
    const keyUp$ = fromEvent(window, "keyup")
    const mouseWheel$ = fromEvent(window, "mousewheel")

    const cmd$ = keyDown$.pipe(
      filter(e => (e as KeyboardEvent).key === "Control"),
      takeUntil(keyUp$)
    )

    const alt$ = keyDown$.pipe(filter(e => (e as KeyboardEvent).key === "Alt"))

    const subUndo = cmd$.pipe(
      switchMapTo(keyDown$.pipe(
        filter(e => (e as KeyboardEvent).key === "Z")
      ))
    ).subscribe(() => {
      console.log("undo");
      dispatch(actUndo())
    })

    const subRedo = cmd$.pipe(
      switchMapTo(keyDown$.pipe(
        filter(e => (e as KeyboardEvent).key === "Shift"),
      )),
      switchMapTo(keyDown$.pipe(
        filter(e => (e as KeyboardEvent).key === "Z")
      ))
    ).subscribe(() => {
      console.log("redo");
      
      dispatch(actRedo())
    })

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
      currCanvasPose.x = nextX
      currCanvasPose.y = nextY
      setCanvasPos((prev) => ({
        ...prev, x: nextX, y: nextY
      }))
    })

    return () => {
      selectMain.unsubscribe()
      subCopy.unsubscribe()
      subDeleteItem.unsubscribe()
      subBgMove.unsubscribe()
      subBgResize.unsubscribe()
      subUndo.unsubscribe()
      subRedo.unsubscribe()
    }
  }, [canvas, dispatch])

  /**让画布随着redux改变 */
  useEffect(() => {
    const { x, y } = canvas
    setCanvasPos(prev => ({ ...prev, x, y }))
  }, [canvas])

  return (
    <div className="work-bg relative" ref={ bgRef }>
      <div
        ref={ container }
        className="display-view absolute"
        style={ {
          width: w + "px",
          height: h + "px",
          transform: `scale(${canvasPos.scale})`,
          left: canvasPos.x,
          top: canvasPos.y
        } }
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

