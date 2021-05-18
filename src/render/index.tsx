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

const { actSelect, actDeleteItems, actChangeWorkingPos, actCopySelectedItems } = EditorActions


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

    const initPos = {
      x: offsetWidth / 2 - w / 2,
      y: offsetHeight / 2 - h / 2,
      scale: 1,
    }
    dispatch(actChangeWorkingPos(initPos))
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

    const cmd$ = keyDown$.pipe(
      filter(e => (e as KeyboardEvent).key === "Control")
    )

    const subDeleteItem = keyDown$.pipe(
      filter(e => (e as KeyboardEvent).key === "Delete")
    ).subscribe(() => {
      dispatch(actDeleteItems())
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
    }
  }, [canvas, dispatch])

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
