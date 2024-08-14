import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Card, Dropdown, Button, Space, Radio, DatePicker, message,
  Checkbox, Skeleton, Empty, Tag, RadioChangeEvent, Typography
} from 'antd';
import type { CheckboxValueType } from 'antd/es/checkbox/Group';
import { DownOutlined } from '@ant-design/icons';
import CustomInput from '../Input';
import moment from 'moment';
import { validateEmail } from '@helpers/common';
import { XMarkIcon, SortDownIcon, SortUpIcon } from '@icons/';
import { CustomFilterProps, DateSelectType } from './types';
import styles from "./styles.module.scss";

const { RangePicker } = DatePicker;
const { Text } = Typography;

const CustomFilter: FC<CustomFilterProps> = (props) => {
  const {
    label, name, type = "radio", options, value, showBg = true,
    onChange, onReset, onUpdate, canReset = true, defaultDate,
    defaultMultiValue, defaultVisible = false, defaultValue,
    withSearch = false, onSearch, searchTerm, loading = false,
    selectedData, removeSelectedData, withSort = false
  } = props;
  // controls the dropdown visibility
  const [visible, setVisible] = useState<boolean>(defaultVisible);

  const dateInstance = new Date();
  // Presets for the date picker
  const todayDate = moment(dateInstance)
  const yesterdayDate = moment(dateInstance).subtract(1, 'days')
  const last7DaysDate = moment(dateInstance).subtract(7, 'days')
  const last30DaysDate = moment(dateInstance).subtract(30, 'days')

  // handle dropdown menu visibility change event
  const onVisibleChange = (flag: boolean) => setVisible(flag);

  // controls the label of the option selected
  const [updatedLabel, setUpdatedLabel] = useState<string>();
  const [dateType, setDateType] = useState<DateSelectType>();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // state to store the date range selected
  const [date, setDate] = useState<any>();

  // state to store the value of the multi select
  const [multiSelectValue, setMultiSelectValue] = useState<CheckboxValueType[]>([]);

  // Event handler for date type change
  const onChangeDateType = (event: RadioChangeEvent) => {
    const value: DateSelectType = event.target.value;
    setDateType(value);
    // the date range selected
    let range: moment.Moment[] = [];

    switch (value) {
      case "today": {
        // date range for today
        range = [todayDate, todayDate]

        onChange(range)
        setDate(range)
        break;
      }
      case "yesterday": {
        // date range for yesterday
        range = [yesterdayDate, todayDate]

        onChange(range)
        setDate(range)
        break;
      }
      case "last7days": {
        // date range for last 7 days
        range = [last7DaysDate, todayDate]

        onChange(range)
        setDate(range)
        break;
      }
      case "last30days": {
        // date range for last 30 days
        range = [last30DaysDate, todayDate]

        onChange(range)
        setDate(range)
        break;
      }
      default: {
        // set the date range to null so that they can select the date range manually
        setDate(null)
        break;
      }
    }
  }

  // Get the label of the selected option
  const getLabel = useCallback((value: any) => {
    let label: string = "";
    // if the type is radio then get the label from the options array
    if (value && type === "radio") {
      for (let item of options!) {
        if (item.value === value) {
          label = item.label;
          break;
        }
      }
    } else if ((value && type === "input") || (type === "email")) {
      // if the type is input then get the label from the value
      label = value
    } else if ((type === "datepicker" && date)) {
      // if the type is datepicker then get the label from the date range selected
      const start = date && date[0]
      const end = date && date[1]
      if (start && end) {
        label = `${start?.format("DD MMM YYYY")} - ${end?.format("DD MMM YYYY")}`
      }
    } else if (defaultDate && type === "datepicker") {
      const start = defaultDate && defaultDate[0]
      const end = defaultDate && defaultDate[1]
      if (start && end) {
        label = `${start?.format("DD MMM YYYY")} - ${end?.format("DD MMM YYYY")}`
      }
    } else if (type === "multiSelect") {
      const multiLabel = (val: any) => {
        const selectedOptions: any = options?.filter((item) => val?.includes(item.value))
        if (selectedOptions?.length > 0) {
          return `${selectedOptions[selectedOptions.length - 1].label} ${selectedOptions.length > 1 ? `(+${selectedOptions.length - 1} more)` : ''}`
        }
        return ""
      }
      label = multiLabel(multiSelectValue)
    }

    // return the label
    return label;
  }, [options, type, date, multiSelectValue]);

  // Start: set the label when there is a default value
  const setDefaultLabel = useCallback(() => {
    if (defaultValue) {
      setUpdatedLabel((prev) => prev ? prev : getLabel(defaultValue))
    }
  }, [defaultValue, getLabel])

  useEffect(() => {
    setDefaultLabel()
  }, [setDefaultLabel])
  // End: set the label when there is a default value

  /** whether to disable the update button or not */
  const isDisableUpdateButton = useMemo(() => {
    if (type === "datepicker") {
      // if the type is datepicker then disable the update button if the date range doen't exist
      return (date && date[0] && date[1]) ? false : true
    } else if (type === "multiSelect") {
      // if the type is multiSelect then disable the update button if the multiSelectValue doesn't exist
      return (multiSelectValue.length > 0) ? false : true
    } else if (type === "radio" || type === "input" || type === "email") {
      // if the type is radio or input or email then disable the update button if the value doesn't exist
      return (value && value.length > 0) ? false : true
    }
    return false
  }, [date, multiSelectValue, type, value, defaultValue])

  // If there's no value then reset the label
  useEffect(() => {
    if (!value) {
      setUpdatedLabel("")
    }
  }, [value])

  const overlay = (
    <Card className={styles.overlay}>
      <div className='pa-3'>
        {/** Selects with or without search */}
        {(type === "multiSelect" || type === "radio") && (
          <>
            {withSearch && (
              <CustomInput
                placeHolder={`Search ${label}...`}
                icon={<img src="/images/searchIcon.svg" alt="Search Icon" />}
                className="mb-2"
                value={searchTerm}
                onChange={onSearch}
                type="text"
                size='w100'
              />
            )}

            {/** Multi selected items */}
            {selectedData && (
              <div className={styles.selectedData}>
                {selectedData?.map((item: any) => (
                  <Tag key={item} className={styles.selectedData_item}>
                    {item}
                    <XMarkIcon
                      width={15}
                      height={15}
                      onClick={() => {
                        removeSelectedData && removeSelectedData(item)
                        // remove the selected item from the multi select value
                        setMultiSelectValue((prev) => prev.filter((val) => val !== item))
                      }}
                      style={{ cursor: "pointer" }}
                    />
                  </Tag>
                ))}
              </div>
            )}

            {loading ? (
              <Skeleton active />
            ) : (
              <>
                {(withSearch && options?.length === 0) ? (
                  <Empty
                    description={searchTerm ? "No results found, please modify your search term" : `Please search for ${label}`}
                  />
                ) : (
                  <>
                    {type === "multiSelect" && (
                      <Checkbox.Group
                        className={styles.checkboxGroup}
                        // value is the value of the selected option
                        value={multiSelectValue}
                        // onchange event handler
                        onChange={(value) => {
                          setMultiSelectValue(value)
                          onChange(value)
                        }}
                        // name is used to identify the radio group
                        name={name}
                        // options is an array of objects with label and value properties for each option
                        options={options}
                        // default value for the radio group
                        defaultValue={defaultMultiValue}
                      />
                    )}

                    {type === "radio" && (
                      <Radio.Group
                        className={styles.radioGroup}
                        // value is the value of the selected option
                        value={value}
                        // onchange event handler
                        onChange={onChange}
                        // name is used to identify the radio group
                        name={name}
                        // options is an array of objects with label and value properties for each option
                        options={options}
                        // default value for the radio group
                        defaultValue={defaultValue}
                      />
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}

        {/** Date Picker */}
        {type === "datepicker" && (
          <>
            <Radio.Group onChange={onChangeDateType} value={dateType}>
              <Space direction="vertical">
                <Radio value="today">Today</Radio>
                <Radio value="yesterday">Yesterday</Radio>
                <Radio value="last7days">Last 7 Days</Radio>
                <Radio value="last30days">Last 30 Days</Radio>
                <Radio value="custom">Custom</Radio>
              </Space>
            </Radio.Group>

            {dateType === "custom" && (
              <RangePicker
                // value is the date range selected
                value={date}
                // onchange event handler
                onChange={(event) => {
                  onChange(event)
                  // set the date range selected
                  setDate(event)
                }}
                // name is used to identify the datepicker
                name={name}
                // default value for the date picker
                defaultValue={defaultDate && [moment(defaultDate[0]), moment(defaultDate[1])]}
                style={{ marginTop: 10 }}
              />
            )}
          </>
        )}

        {/** Input Or Email  */}
        {(type === "input" || type === "email") && (
          <CustomInput
            // value is the value of the input
            value={value}
            // onchange event handler
            onChange={onChange}
            // name is used to identify the input
            name={name}
            // default value for the input
            defaultValue={defaultValue}
            className={styles.input}
          />
        )}
      </div>

      <div className={styles.footerButtonWrap}>
        {canReset && (
          <Button
            danger style={{ borderRadius: 5 }}
            onClick={() => {
              // reset the selected option
              onReset && onReset();
              // close the dropdown menu
              setVisible(false);
              // reset the label
              setUpdatedLabel("")
              // reset the date range
              if (type === "datepicker") {
                setDate(undefined)
              }
              // reset the multi select value
              if (type === "multiSelect") {
                setMultiSelectValue([])
              }
            }}
          >
            Reset
          </Button>
        )}
        <Button
          onClick={() => {
            // update the selected option
            switch (type) {
              // validate the email address if the type is email before updating the filter
              case "email": {
                if (!validateEmail(value!)) {
                  return message.error("Please enter a valid email address")
                } else {
                  onUpdate();
                }
                break;
              }
              default: {
                onUpdate();
                break;
              }
            }
            // update the label of the filter
            setUpdatedLabel(getLabel(value));
            // close the dropdown menu
            setVisible(false);
          }}
          // disable the button if no option is selected 
          disabled={isDisableUpdateButton}
          className={styles.updateButton}
        >
          Update
        </Button>
      </div>
    </Card>
  )

  return (
    <div className={styles.customFilter}>
      {withSort && (
        <div className={styles.sort}>
          {sortOrder === "asc" ? (
            <SortDownIcon
              width={18} height={18} color='#fff'
              onClick={() => {
                setSortOrder("desc")
                onUpdate({ sortOrder: "desc" });
              }}
            />
          ) : (
            <SortUpIcon
              width={18} height={18} color='#fff'
              onClick={() => {
                setSortOrder("asc")
                onUpdate({ sortOrder: "asc" });
              }}
            />
          )}
        </div>
      )}
      <Dropdown
        // overlay is the dropdown menu or content
        dropdownRender={() => overlay}
        // trigger is an array of events that will trigger the dropdown menu
        trigger={["click"]}
        // visible is the state of the dropdown menu
        open={visible}
        // onVisibleChange is the event handler for the dropdown menu visibility change
        onOpenChange={onVisibleChange}
      >
        <div
          onClick={() => setVisible(!visible)}
          className={updatedLabel ? `${styles.updated} ${!showBg ? styles.no_bg : ""}` : styles.label}
        >
          {/** label is the label of the dropdown menu */}
          <Space>
            <Text
              ellipsis={{ tooltip: updatedLabel }}
              style={{
                width: updatedLabel ? 120 : "fit-content",
                color: updatedLabel ? "#fff" : "var(--color-dark-main)",
                padding: updatedLabel ? 1 : 0,
              }}
            >
              {updatedLabel ? `${label}: ${updatedLabel}` : label}
            </Text>
            <DownOutlined />
          </Space>
        </div>
      </Dropdown>
    </div>
  );
}
export default CustomFilter;