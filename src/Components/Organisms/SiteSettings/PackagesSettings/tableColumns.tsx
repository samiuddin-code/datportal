import { message, Popconfirm, Switch, Table } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { convertDate } from "../../../../helpers/dateHandler";
import Typography from "../../../Atoms/Headings";
import styles from "./styles.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import { tableProps } from "./packageSettings";
import { RootState } from "../../../../Redux/store";
import {
  deletePackage,
  editPackageDataAction,
  getPackageData,
} from "../../../../Redux/Reducers/PackagesReducer/action";
import { dispatchType } from "../../../../Redux/Reducers/commonTypes";
import { PackageTypes } from "../../../../Modules/Package/types";
import { PackagePermissionsEnum } from "../../../../Modules/Package/permissions";

interface ActionComponentProps {
  record: PackageTypes;
  openModal: (data: any) => void;
  permissions: { [key in PackagePermissionsEnum]: boolean };
}

const ActionComponent = (props: ActionComponentProps) => {
  const {
    record, openModal, permissions: {
      deletePackage: deletePackagePermission,
    }
  } = props;
  const dispatch = useDispatch<dispatchType>();

  const onDelete = useCallback((id: number) => {
    if (deletePackagePermission === true) {
      dispatch(deletePackage(id, () => dispatch(getPackageData())));
    } else {
      message.error("You don't have permission to delete this record, please contact your admin.");
    }
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
  const { tableData, tableLoading, openModal } = props;
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const permissions = userPermissions as { [key in PackagePermissionsEnum]: boolean };

  const dispatch = useDispatch<dispatchType>();
  const { editPackageData } = useSelector((state: RootState) => state.packageReducer);

  const onPublishChange = (checked: boolean, record: any) => {
    if (permissions.updatePackage === true) {
      dispatch(
        editPackageDataAction(
          { isPublished: checked ? "true" : "false" },
          record, () => dispatch(getPackageData())
        )
      );
    } else {
      message.error("You don't have permission to update this record, please contact your admin.");
    }
  };

  const columns = [
    {
      title: "S.No",
      dataIndex: "name",
      key: "index",
      render: (text: string, record: {}, index: number) => index + 1,
      width: "5%",
    },
    {
      title: "Title",
      dataIndex: ["localization", "0"],
      key: "title",
      render: (text: { title: string | undefined; description: string | undefined; }) => (
        <>
          <Typography color="dark-main" size="sm" weight="bold">
            {text?.title}
          </Typography>
          <div
            className="color-dark-sub font-size-xs"
            dangerouslySetInnerHTML={{
              __html: text?.description!,
            }}
          ></div>
        </>
      ),
    },
    {
      title: "Country",
      dataIndex: ["country", "name"],
      key: "country",
      render: (text: string | undefined,) => (
        <Typography color="dark-sub" size="sm">
          {text}
        </Typography>
      ),
    },
    {
      title: "Credits",
      dataIndex: "credits",
      key: "credits",
      render: (text: string | undefined) => (
        <Typography color="dark-sub" size="sm">
          {text}
        </Typography>
      ),
    },
    {
      title: "Features",
      dataIndex: "features",
      key: "features",
      render: (text: string, record: PackageTypes) => (
        <>
          <Typography color="dark-sub" size="sm">
            {`Featured: ${record.makeFeatured === true ? "Yes" : "No"}`}
          </Typography>
          <Typography color="dark-sub" size="sm" className="my-1">
            {`Premium: ${record.makePremium === true ? "Yes" : "No"}`}
          </Typography>
          <Typography color="dark-sub" size="sm">
            {`Duration: ${record.duration} days`}
          </Typography>
        </>
      ),
    },
    {
      title: "Added Date",
      dataIndex: "addedDate",
      key: "addedDate",
      render: (text: string | number | Date) => {
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
      render: (text: boolean | undefined, record: {}) => (
        <Switch
          checked={text}
          onChange={(checked) => onPublishChange(checked, record)}
          loading={editPackageData.loading}
        />
      ),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (text: string, record: PackageTypes) => (
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
