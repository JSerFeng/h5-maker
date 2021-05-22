import produce from "immer";
import { FC, memo, useRef } from "react";
import { Dispatch as ReduxDispatch } from "redux"
import {
  EditorConfig,
  EditorTypes,
  ReactComp,
  WidgetConfig,
  WidgetConfigProp
} from "../../../render/interfaces";
import { EditorActions } from "../../../store/editorReducer";
import { ChromePicker } from "react-color"
import {
  Button,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio
} from "@material-ui/core";

const { actWidgetConfig } = EditorActions

const SingleConfig: FC<{
  widgetConfig: WidgetConfig<EditorConfig[]>,
  dispatch: ReduxDispatch,
  CustomConfig?: ReactComp<WidgetConfigProp> | null
}> = ({ widgetConfig, dispatch, CustomConfig }) => {
  const defaultConfig = useRef(widgetConfig.config)

  if (widgetConfig.editorConfig === null ||
    widgetConfig.config === null
  ) {
    return <div>无可配置选项</div>
  }

  const dispatchProperty = (key: string, value: any) => {
    dispatch(actWidgetConfig(produce(widgetConfig, it => {
      it.config[key] = value
    })))
  }

  return (
    <div>
      {
        widgetConfig.editorConfig.length === 0
          ? <div>组件没有可配置项</div>
          : <div>
            <div>
              层级
              <TextField placeholder="层级" value={ widgetConfig.style?.zIndex || 0 } />
            </div>
            {
              widgetConfig.editorConfig.map((editorConfig, i) => {
                const { name, key } = editorConfig
                return <div key={ key }>
                  <div>
                    { name }
                  </div>
                  <div>
                    { getConfig(editorConfig, widgetConfig.config[key], dispatchProperty.bind(null, key)) }
                  </div>
                </div>
              })
            }
            {
              CustomConfig && <CustomConfig
                widgetConfig={ widgetConfig }
                dispatchConfig={ newWidgetConfig => {
                  dispatch(actWidgetConfig(newWidgetConfig))
                } }
              />
            }
            <Button
              onClick={
                () => {
                  dispatch(actWidgetConfig(produce(widgetConfig, it => {
                    it.config = defaultConfig.current
                  })))
                }
              }
              color="secondary"
              variant="contained"
            >重置</Button>
          </div>
      }
    </div>
  )
}

function getConfig<T extends EditorTypes>(
  config: EditorConfig<T>,
  value: any,
  setProperty: (val: any) => void
) {
  switch (config.type) {
    case EditorTypes.Color:
      return <ChromePicker color={ value } onChange={ color => {
        setProperty(color.hex)
      } } />
    case EditorTypes.Text:
      return <TextField value={ value } onChange={ e => {
        setProperty(e.target.value)
      } } />
    case EditorTypes.Number:
      return <TextField value={ value } onChange={ e => {
        setProperty(e.target.value)
      } } />
    case EditorTypes.Select:
      return <div>
        <RadioGroup
          value={ value }
          onChange={ e => { setProperty(e.target.value) } }
        >
          {
            (config as EditorConfig<EditorTypes.Select>).options.map(({ label, value }) => (
              <FormControlLabel
                key={ value }
                control={ <Radio /> }
                label={ label }
                value={ value }
              />
            ))
          }
        </RadioGroup>
      </div>
    default: return null
  }
}

export default memo(SingleConfig)
