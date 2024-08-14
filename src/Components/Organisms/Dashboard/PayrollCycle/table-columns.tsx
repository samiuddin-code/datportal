import { useState } from "react";
import { Button, Drawer, message, Popconfirm, Spin, Table, Tag } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import Typography from "../../../Atoms/Headings";
import styles from "../../Common/styles.module.scss";
import { ActionComponentProps, TableProps } from "../../Common/common-types";
import { Switch } from "../../../Atoms/Switch";
import { useSelector } from "react-redux";
import { RootState } from "../../../../Redux/store";
import { PayrollCycleType } from "../../../../Modules/PayrollCycle/types";
import { PayrollCyclePermissionsEnum } from "../../../../Modules/PayrollCycle/permissions";
import { PayrollCycleModule } from "../../../../Modules/PayrollCycle";
import { APIResponseObject } from "@modules/Common/common.interface";
import TextArea from "antd/lib/input/TextArea";
import { convertDate } from "@helpers/dateHandler";
import { handleError, isDateInRange } from "@helpers/common";

interface _ActionComponentProps extends ActionComponentProps {
  record: PayrollCycleType,
  permissions: { [key in PayrollCyclePermissionsEnum]: boolean };
}

const ActionComponent = (props: _ActionComponentProps) => {
  const {
    record, onEditIconClick, reloadTableData,
    permissions: { deletePayrollCycle }
  } = props;

  const [actionState, setActionState] = useState({
    confirmLoading: false,
    openPopConfirm: false,
  });
  const module = new PayrollCycleModule();

  const handleDelete = () => {
    setActionState({
      ...actionState,
      confirmLoading: true,
    });

    if (deletePayrollCycle === false) {
      message.error("You don't have permission to delete this record, please contact your admin.");
      setActionState({
        ...actionState,
        openPopConfirm: false,
      });
      return;
    }

    module.deleteRecord(record.id).then((res) => {
      setActionState({
        ...actionState,
        openPopConfirm: false,
        confirmLoading: false,
      });
      reloadTableData();
    }).catch((err) => {
      let errors = handleError(err);
      message.error(errors);
      setActionState({
        ...actionState,
        confirmLoading: false,
      });
    });
  };

  const showPopconfirm = () => {
    setActionState({
      ...actionState,
      openPopConfirm: true,
    });
  };

  return (
    <div className={styles.actions}>
      {/* <span onClick={() => onEditIconClick(record)}>
				<img src="/images/editicon.svg" alt="" />
			</span> */}
      {!record.processed && !record.processing &&
        <Popconfirm
          open={actionState.openPopConfirm}
          placement="top"
          title="Are you sure?"
          onConfirm={handleDelete}
          onCancel={() => setActionState({ ...actionState, openPopConfirm: false })}
          okButtonProps={{ loading: actionState.confirmLoading }}
          okText="Yes"
          cancelText="No"
          onOpenChange={(visible) => {
            if (!visible) {
              setActionState({ ...actionState, openPopConfirm: false });
            }
          }}
        >
          <DeleteOutlined className={styles.bg__red} onClick={showPopconfirm} />
        </Popconfirm>
      }
    </div>
  );
};


export default function TableComponent(props: TableProps & { tableData: PayrollCycleType[], meta: APIResponseObject["meta"], filters: any }) {
  const { tableData, tableLoading, onEditIconClick, reloadTableData, meta, filters } = props;
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const [openDrawer, setOpenDrawer] = useState({
    report: [] as any[],
    open: false
  });
  const [loading, setLoading] = useState(false);
  const permissions = userPermissions as { [key in PayrollCyclePermissionsEnum]: boolean };

  const module = new PayrollCycleModule();

  const ReportDrawer = () => {
    return (
      <Drawer
        width={window.innerWidth > 768 ? "50%" : "100%"}
        bodyStyle={{ paddingRight: '1rem' }} title="Failed Report" placement="right"
        onClose={() => setOpenDrawer({ report: [], open: false })} open={openDrawer.open}
      >
        <p className="text-center font-weight-bold" style={{ fontStyle: 'italic' }}>Note: This report is for developers, please ignore</p>
        <ul>
          {openDrawer.report.length > 0 ? openDrawer.report.map((item, index) => <li className="mt-5" key={index}>{(typeof item == "string") ? item : JSON.stringify(item)}</li>) : "No reports found"}
        </ul>
      </Drawer>
    )
  }

  const startPayrollProcess = (recordId: number) => {
    setLoading(true);
    module.processRecord(recordId).then(res => {
      let data = res?.data;
      setLoading(false);
      message.success(data.message);
      reloadTableData();
    }).catch(err => {
      let errors = handleError(err);
      message.error(errors);
      setLoading(false);
    })
  }


  const columns = [
    {
      title: "S.No",
      dataIndex: "index",
      key: "index",
      render: (text: string, record: {}, index: number) => index + 1,
      width: "5%",
    },
    {
      title: "Period",
      dataIndex: "fromDate",
      key: "fromDate",
      render: (fromDate: Date, record: PayrollCycleType) => (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Typography color="dark-sub" size="sm">
            {convertDate(fromDate, "dd M,yy") + " - " + convertDate(record.toDate, "dd M,yy")}
          </Typography>
          {isDateInRange(new Date(), fromDate, record.toDate) ?
            <Tag color="green">Current</Tag>
            : null}
        </div>
      ),
      width: "25%"
    },
    {
      title: "Failed Report",
      dataIndex: "failedReport",
      key: "failedReport",
      render: (_failedReport: string, record: PayrollCycleType) => (
        record.failedReport ? (
          <>
            <Button size="small" onClick={() => setOpenDrawer({ open: true, report: (record.failedReport) ? record.failedReport as any[] : [] })}>View Report</Button>
          </>
        ) : null
      ),
    },
    {
      title: "Report",
      dataIndex: "addedDate",
      key: "addedDate",
      render: (addedDate: string, record: PayrollCycleType) => (
        <>
          {
            (record.processing) ?
              <Spin />
              :
              <>
                <Typography color="dark-sub" size="sm">
                  {`Added: ${convertDate(addedDate, "dd M,yy")}`}
                </Typography>
                <Typography color="dark-sub" size="sm">
                  {`Processed: ${record.processed ? convertDate(record.processedDate, "dd M,yy") : "Not yet processed"}`}
                </Typography>
                {
                  (!record.processing && !record.processed &&
                    <Popconfirm
                      placement="top"
                      title="Are you sure?"
                      onConfirm={() => startPayrollProcess(record.id)}
                      okButtonProps={{ loading: loading }}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button type='ghost' size='small' className="mt-2 font-weight-semi">
                        Process Now
                      </Button>
                    </Popconfirm>
                  )
                }
              </>
          }
        </>
      ),
    },
    {
      title: "Others",
      dataIndex: "others",
      key: "others",
      render: (_others: string, record: PayrollCycleType) => (
        <>
          <Typography color="dark-sub" size="sm">
            {`Success: ${record.success}`}
          </Typography>

          <Typography color="dark-sub" size="sm">
            {`Failed: ${record.failed}`}
          </Typography>

          <Typography color="dark-sub" size="sm">
            {`Total records: ${record.success + record.failed}`}
          </Typography>
        </>
      ),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (text: string, record: PayrollCycleType) => (
        <ActionComponent
          record={record}
          onEditIconClick={onEditIconClick}
          reloadTableData={reloadTableData}
          permissions={permissions}
        />
      ),
    },
  ];

  return (
    <div className={styles.antdTableWrapper}>
      <Table
        sticky
        dataSource={tableData}
        columns={columns}
        pagination={{
          current: meta?.page,
          total: meta?.total,
          hideOnSinglePage: false,
          pageSize: meta?.perPage,
          onChange(page, pageSize) {
            reloadTableData({ ...filters, page: page, perPage: pageSize })
          },
        }}
        scroll={{ x: 991 }}
        loading={tableLoading}
        rowKey={(record: PayrollCycleType) => `PayrollCycle-${record.id}`}
      />

      {openDrawer.open && <ReportDrawer />}

    </div>
  );
}
