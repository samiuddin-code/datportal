import { message, Popconfirm, Switch, Table } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { convertDate } from "../../../../helpers/dateHandler";
import Typography from "../../../Atoms/Headings";
import styles from "./styles.module.scss";
import { RESOURCE_BASE_URL } from "../../../../helpers/constants";
import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import {
  deleteCountry,
  editCountryDataAction,
  getCountryData,
} from "../../../../Redux/Reducers/countryReducer/action";
import { tableProps } from "./countrySettings";
import { RootState } from "../../../../Redux/store";
import { dispatchType } from "../../../../Redux/Reducers/commonTypes";
import { CountryPermissionsEnum } from "../../../../Modules/Country/permissions";

interface ActionComponentProps {
  record: { id: string };
  openModal: any
  permissions: { [key in CountryPermissionsEnum]: boolean };
}

const ActionComponent = (props: ActionComponentProps) => {
  const { record, openModal, permissions: {
    deleteCountry: deletePermission,
  } } = props;
  const dispatch = useDispatch<dispatchType>();

  const onDelete = useCallback((id: string) => {
    if (deletePermission === false) {
      message.error("You don't have permission to delete this record, please contact your admin.");
      return;
    }
    dispatch(deleteCountry(id, () => dispatch(getCountryData())));
  }, [dispatch]);

  return (
    <div className={styles.actions}>
      <span onClick={() => openModal(record)}>
        <img src="/images/editicon.svg" alt="" />
      </span>
      <Popconfirm
        placement="top"
        title={"Are you sure?"}
        onConfirm={() => onDelete(record.id)}
        okText={"Yes"}
        cancelText={"No"}
      >
        <DeleteOutlined className={styles.bg__red} />
      </Popconfirm>
    </div>
  );
};
export default function TableComponent(props: tableProps) {
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const permissions = userPermissions as { [key in CountryPermissionsEnum]: boolean };

  const { tableData, tableLoading, openModal } = props;
  const dispatch = useDispatch<dispatchType>();
  const { editCountryData } = useSelector(
    (state: RootState) => state.countryReducer
  );

  const onPublishChange = (checked: boolean, record: { id: string }) => {
    if (permissions.updateCountry === false) {
      message.error("You don't have permission to update this record, please contact your admin.");
      return;
    }
    const formData = new FormData();
    formData.append("isPublished", checked ? "true" : "false");
    dispatch(
      editCountryDataAction(formData, record, () => {
        dispatch(getCountryData());
      })
    );
  };

  const columns = [
    {
      title: "S.No",
      dataIndex: "name",
      key: "index",
      render: (text: string | undefined, record: { id: string }, index: number) =>
        index + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string | undefined, record: { id: string }, index: number) => (
        <Typography color="dark-sub" size="sm">
          {text}
        </Typography>
      ),
    },
    {
      title: "ISO Code",
      dataIndex: "isoCode",
      key: "isoCode",
      render: (text: string, record: { id: string }, index: number) => (
        <Typography color="dark-sub" size="sm">
          {text}
        </Typography>
      ),
    },
    {
      title: "Phone Code",
      dataIndex: "phoneCode",
      key: "phoneCode",
      render: (text: string, record: { id: string }, index: number) => (
        <Typography color="dark-sub" size="sm">
          {text}
        </Typography>
      ),
    },
    {
      title: "Flag",
      dataIndex: "flag",
      key: "flag",
      render: (text: string, _record: { id: string }) => (
        <span>{text}</span>
      ),
    },
    {
      title: "Added Date",
      dataIndex: "addedDate",
      key: "addedDate",
      render: (text: string, _record: { id: string }) => {
        return (
          <Typography color="dark-sub" size="sm">
            {convertDate(text, "dd M,yy")}
          </Typography>
        );
      },
    },
    {
      title: "Published",
      dataIndex: "isPublished",
      key: "isPublished",
      render: (text: boolean | undefined, record: { id: string }, index: number) => (
        <Switch
          checked={text}
          onChange={(checked) => onPublishChange(checked, record)}
          loading={editCountryData.loading}
        />
      ),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (text: string, record: { id: string; }) => (
        <ActionComponent
          record={record}
          openModal={openModal}
          permissions={permissions}
        />
      ),
    },
  ];
  return (
    <Table
      sticky
      dataSource={tableData}
      columns={columns}
      pagination={false}
      loading={tableLoading}
    />
  );
}
