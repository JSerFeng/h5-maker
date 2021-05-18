import produce from "immer";
import { Dispatch, FC, memo } from "react";
import { Dispatch as ReduxDispatch } from "redux"
import { EditorTypes, WidgetConfig } from "../../../render/interfaces";
import { EditorActions } from "../../../store/editorReducer";
import { SketchPicker } from "react-color"

import { Row, Col, Input, InputNumber } from "antd"

const { actWidgetConfig } = EditorActions

const SingleConfig: FC<{
  widgetConfig: WidgetConfig,
  dispatch: ReduxDispatch
}> = ({ widgetConfig, dispatch }) => {
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
          : widgetConfig.editorConfig.map(({ name, key, type }, i) => (
            <div key={ i }>
              <Configuration
                name={ name }
                type={ type }
                value={ widgetConfig.config[key] }
                setProperty={ dispatchProperty.bind(null, key) }
              />
            </div>
          ))
      }
    </div>
  )
}

const Configuration: FC<{
  setProperty: Dispatch<any>,
  name: string,
  type: EditorTypes,
  value: any
}> = ({ setProperty, name, type, value }) => {

  return (
    <Row>
      <Col span={ 12 }>{ name }</Col>
      { getConfig(type, value, setProperty) }
    </Row>
  )
}


const getConfig = (type: EditorTypes, value: any, setProperty: Dispatch<any>) => {
  switch (type) {
    case EditorTypes.Color:
      return <SketchPicker color={ value } onChange={ color => {
        setProperty(color.hex)
      } } />
    case EditorTypes.Text:
      return <Input value={ value } onChange={ e => {
        setProperty(e.target.value)
      } } />
    case EditorTypes.Number:
      return <InputNumber value={ value } onChange={ setProperty } />
    default: return null
  }
}

export default memo(SingleConfig)
