import { Dispatch, FC, useState } from "react";
import { ColumnsType } from "antd/es/table";
import { Table, Typography as AntdTypography, Button } from "antd";
import { Typography } from "@atoms/";
import { TableProps } from "@organisms/Common/common-types";
import { InvoiceTypes } from "@modules/Invoice/types";
import { InvoicePermissionsEnum } from "@modules/Invoice/permissions";
import { InvoiceDrawerTypes } from "./Drawer/types";
import ActionComponent from "./actions";
import InvoiceStatusComp from "./status";
import { formatCurrency } from "@helpers/common";
import QuickUpdate from "./quick-update";
import styles from "./styles.module.scss";

const { Paragraph } = AntdTypography;

interface InvoiceTableProps extends TableProps<InvoiceTypes> {
  permissions: { [key in InvoicePermissionsEnum]: boolean };
  setDrawer: Dispatch<React.SetStateAction<InvoiceDrawerTypes>>
  onAddNoteClick: (record: InvoiceTypes) => void;
}

type QuickUpdateTypes = {
  open: boolean
  invoiceId: number
  initialProjectId: number
}

const InvoicesTable: FC<InvoiceTableProps> = (props) => {
  const {
    tableData, tableLoading, emptyText, reloadTableData,
    permissions, setDrawer, onAddNoteClick
  } = props;
  // Quick Update Modal State
  const [quickUpdate, setQuickUpdate] = useState<QuickUpdateTypes>({
    open: false, invoiceId: 0, initialProjectId: 0
  })

  const columns: ColumnsType<InvoiceTypes> = [
    {
      title: "S.No",
      dataIndex: "index",
      key: "index",
      render: (_text: string, _record, index: number) => index + 1,
      width: "60px",
    },

    {
      title: 'Client',
      dataIndex: "Client",
      key: "Client",
      render: (Client: InvoiceTypes['Client'], record) => (
        <>
          {/**Invoice Number */}
          <Typography color="dark-main" size="sm" className="mb-1">
            {record.invoiceNumber}
          </Typography>

          <Typography color="dark-main">
            {Client?.name}
          </Typography>

          {Client?.email && (
            <Paragraph
              ellipsis={{ rows: 1, expandable: false }}
              copyable={{ text: Client?.email }}
              className="font-size-xs color-dark-sub mb-0"
            >
              <a href={`mailto:${Client?.email}`} style={{ color: 'var(--color-dark-sub)' }}>
                {Client?.email}
              </a>
            </Paragraph>
          )}

          {Client?.phone && (
            <Paragraph
              ellipsis={{ rows: 1, expandable: false }}
              copyable={{ text: `${Client?.phoneCode}${Client?.phone}` }}
              className="font-size-xs color-dark-sub"
            >
              <a href={`tel:${Client?.phoneCode} ${Client?.phone}`} style={{ color: 'var(--color-dark-sub)' }}>
                {`${Client?.phoneCode}${Client?.phone}`}
              </a>
            </Paragraph>
          )}
        </>
      ),
      width: '240px'
    },
    {
      title: 'Project',
      dataIndex: "Project",
      key: "Project",
      render: (Project: InvoiceTypes['Project']) => (
        <Typography color="dark-main">
          {`${Project?.referenceNumber || ""} ${Project?.referenceNumber ? "|" : ""} ${Project?.title || ""}`}
        </Typography>
      ),
      width: '240px'
    },
    {
      title: "Message/Note",
      dataIndex: "message",
      key: "message",
      render: (message: string, record: InvoiceTypes) => {
        const { InvoiceFollowUp } = record;
        return (
          <>
            <div
              className={styles.container}
              style={{
                // backgroundColor: "var(--color-border)",
                padding: "10px",
                borderRadius: "2px",
                fontSize: "var(--font-size-sm)",
              }}
            >
              {InvoiceFollowUp?.length > 0 ? InvoiceFollowUp?.map((item, index) => (
                <Paragraph ellipsis={{
                  rows: 5
                }} style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-dark-main)' }}>{item.note}</Paragraph>

              )) : (
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-dark-100)' }}>No notes</p>
              )}
              <div className={styles.button}>
                <Button
                  type="ghost" size="small"
                  style={{ fontSize: 'var(--font-size-xs)' }}
                  onClick={() => onAddNoteClick(record)}
                >
                  {(InvoiceFollowUp?.length === 0) ? "Add Note" : "Manage Notes"}
                </Button>
              </div>
            </div>
          </>
        )
      },
      width: "400px",
    },
    {
      title: 'Overview',
      dataIndex: "total",
      key: "total",
      render: (total: InvoiceTypes['total'], record) => (
        <>
          <Typography color="dark-main">
            {`Total Amount: ${formatCurrency(total)}`}
          </Typography>

          <Button
            type="ghost" size="small" style={{ fontSize: '0.8rem' }}
            className="mt-1"
            onClick={() => setDrawer({
              open: true, id: record.id, type: "preview"
            })}
          >
            Preview File
          </Button>
        </>
      ),
      width: '150px'
    },
    {
      title: 'Status',
      dataIndex: "status",
      key: "status",
      className: "text-center",
      render: (_status: number, record) => (
        <InvoiceStatusComp
          item={record}
          permissions={permissions}
          onRefresh={() => reloadTableData()}
          setDrawer={setDrawer}
        />
      ),
      width: '180px'
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_actions: string, record: InvoiceTypes) => (
        <ActionComponent
          record={record}
          setDrawer={setDrawer}
          reloadTableData={reloadTableData}
          permissions={permissions}
          setQuickUpdate={setQuickUpdate}
        />
      ),
      width: "120px",
    }
  ];

  return (
    <>
      <Table
        sticky
        dataSource={tableData} columns={columns}
        pagination={false} scroll={{ x: 991 }}
        loading={tableLoading} rowKey={(record) => `invoice-${record.id}`}
        locale={{ emptyText: emptyText }}
      />

      {/** Quick Update */}
      {quickUpdate?.open && (
        <QuickUpdate
          open={quickUpdate.open} invoiceId={quickUpdate.invoiceId}
          initialProjectId={quickUpdate.initialProjectId}
          onClose={() => {
            setQuickUpdate({ open: false, invoiceId: 0, initialProjectId: 0 })
            reloadTableData()
          }}
        />
      )}
    </>
  );
}

export default InvoicesTable;