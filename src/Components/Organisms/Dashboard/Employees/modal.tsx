import { Drawer, Tabs, TabsProps } from "antd";
import { PropTypes } from "../../Common/common-types";
import { UserPermissionsEnum } from "../../../../Modules/User/permissions";
import { EmployeeBasicForm } from "./Form/Basic";
import { ComponentType, useState } from "react";
import { Additional } from "./Form/Additional";
import { Files } from "./Form/Files";
import { Resources } from "./Form/Resources";
import { Salary } from "./Form/Salary";
import { LeavesReport } from "./Form/LeavesReport";

interface EmployeeModalProps extends PropTypes {
  record: number;
  permissions: { [key in UserPermissionsEnum]: boolean };
  currentForm: string
}

export const EmployeeModal = (props: EmployeeModalProps) => {
  const {
    openModal, onCancel, type, record, reloadTableData,
    permissions: { createUser, updateUser, manageAllUser }
  } = props;
  const [currentForm, setCurrentForm] = useState(props.currentForm);

  const formTabs: TabsProps['items'] = [
    {
      key: '1',
      label: `Basic Information`,
    },
    {
      key: '2',
      label: `Additional Information`,
      disabled: (type === "edit") ? false : true
    },
    {
      key: '3',
      label: `Files`,
      disabled: (type === "edit") ? false : true
    },
    {
      key: '4',
      label: `Allocated Resources`,
      disabled: (type === "edit") ? false : true
    },
    {
      key: '5',
      label: `Salary`,
      disabled: (type === "edit") ? false : true
    },
    {
      key: '6',
      label: `Leaves Report`,
      disabled: (type === "edit") ? false : true
    },
  ];

  const formComponents: { [key: string]: ComponentType<any> } = {
    "1": EmployeeBasicForm,
    "2": Additional,
    "3": Files,
    "4": Resources,
    "5": Salary,
    "6": LeavesReport,
  };

  const FormComponent = formComponents[currentForm];

  return (
    <Drawer
      title={type === "edit" ? "Edit User" : "Add New User"}
      placement="right"
      width={window.innerWidth > 768 ? "60%" : "100%"}
      onClose={() => onCancel()}
      open={openModal}
      bodyStyle={{ padding: '0rem 2rem 1rem 2rem' }}
    >
      <Tabs defaultActiveKey={currentForm} items={formTabs} onChange={(e) => setCurrentForm(e)} />

      <FormComponent
        type={type}
        openModal={openModal}
        record={record}
        onCancel={onCancel}
        createUser={createUser}
        updateUser={updateUser}
        manageAllUser={manageAllUser}
        setCurrentForm={setCurrentForm}
        reloadTableData={reloadTableData}
      />
    </Drawer >
  );
};
