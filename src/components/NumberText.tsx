import { TextField } from "@material-ui/core";
import { FC, useState } from "react";

const NumberText: FC<{
  value: number | string,
  onChange(val: number): void
}> = ({ value, onChange }) => {
  const [val, setVal] = useState(value)
  return (
    <TextField
      value={ val }
      onChange={
        e => {
          const num = Number(e.target.value)
          setVal(num)
          onChange(num)
        }
      }
    />
  )
}

export default NumberText
