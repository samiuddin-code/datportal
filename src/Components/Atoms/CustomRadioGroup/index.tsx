import { Radio, RadioChangeEvent } from "antd";
import style from "./input.module.scss";
import React, { useEffect, useState } from "react";
import { AppProps } from "./radioGroup";

const CustomRadio = (props: AppProps) => {
  const {type,items,defaultValue,onChange,name,...rest}=props
  const [value,setValue]=useState(defaultValue)
  useEffect(()=>{
    setValue(defaultValue)},[defaultValue])
  const onRadioChange = (e: RadioChangeEvent) => {
    setValue(e.target.value);
    onChange&&onChange(e);
  };
      return (
        <div className={style.radioWrap+" "+(type==="smallTrack"?style.smallTrack:"")}>
          <Radio.Group
          {...rest}
            className={style.radio}
            buttonStyle="solid"
            defaultValue={defaultValue}
            value={value}
            onChange={onRadioChange}
            name={name}
          >
            {items.map((item) => (
              <Radio.Button value={item.value} className={type} key={item.value}>{item.label}</Radio.Button>
            ))}
          </Radio.Group>
        </div>
      );
};
CustomRadio.defaultProps = {
  type: "largeTrack",
  items: [],
  onChange:()=>{},
  name:"radio"
};
export default CustomRadio;
