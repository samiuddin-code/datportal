import { type FC, useState, useCallback } from 'react';
import { SelectProps } from 'antd';
import { SelectWithSearch } from '@atoms/';
import UserPopover from './user-popover';
import { UserTypes } from '@modules/User/types';
import styles from './styles.module.scss';

/**Conditional type for showing popover. If showPopover is true,
 * then user is required else it is not required
 */
type ShowPopoverProps = | {
  showPopover: true;
  user: UserTypes
} | {
  showPopover: false;
  user?: UserTypes | undefined;
};

type SelectableDropdownProps = SelectProps & {
  /** Options to be displayed select dropdown */
  options: {
    value: string
    label: string
    icon: JSX.Element
  }[]
  disableOption?: string[]
  onSearch: (value: string) => void
  loading?: boolean
  notFoundDescription?: string
} & ShowPopoverProps

/** Custom dropdown component with selectable items */
const SelectableDropdown: FC<SelectableDropdownProps> = (props) => {
  const {
    showPopover = true, user, defaultValue, options,
    disableOption, placeholder = 'Select an user',
    notFoundDescription, loading = false, ...rest
  } = props

  const [open, setOpen] = useState<{ popover: boolean; dropdown: boolean }>({
    popover: false,
    dropdown: false
  })

  const onOpenChange = useCallback((visible: boolean) => {
    if (open?.dropdown && !visible) {
      setOpen({ ...open, popover: true })
    } else if (!open?.dropdown && visible) {
      setOpen({ ...open, popover: true })
    } else {
      setOpen({ ...open, popover: false })
    }
  }, [open])

  const onDropdownVisibleChange = useCallback((visible: boolean) => {
    if (visible) {
      setOpen({ popover: false, dropdown: true })
    } else {
      setOpen({ popover: false, dropdown: false })
    }
  }, [open])

  return (
    <>
      {showPopover ? (
        <UserPopover
          type='user' user={user!}
          open={open?.popover}
          onOpenChange={onOpenChange}
        >
          <SelectWithSearch
            {...rest}
            bordered={false} customOption
            placeholder={placeholder}
            notFoundDescription={notFoundDescription || 'No user found'}
            defaultValue={defaultValue}
            options={options.map((option) => ({
              label: option?.label,
              value: option?.value,
              icon: option?.icon
            }))}
            disableOption={disableOption}
            open={open?.dropdown}
            onDropdownVisibleChange={onDropdownVisibleChange}
            className={`${styles.selectable_dropdown} selectWithIcon`}
            style={{ padding: '0px' }}
            loading={loading}
          />
        </UserPopover>
      ) : (
        <SelectWithSearch
          {...rest}
          bordered={false} customOption
          placeholder={placeholder}
          notFoundDescription={notFoundDescription || 'No user found'}
          defaultValue={defaultValue}
          options={options.map((option) => ({
            label: option?.label,
            value: option?.value,
            icon: option?.icon
          }))}
          disableOption={disableOption}
          open={open?.dropdown}
          onDropdownVisibleChange={onDropdownVisibleChange}
          className={styles.selectable_dropdown}
          loading={loading}
        />
      )}
    </>
  );
}
export default SelectableDropdown;