import { useState, type FC, Dispatch, SetStateAction, useMemo } from 'react';
import { Button, Checkbox, Popconfirm, Table, Tooltip, message } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { QuotationTypes, QuotationMilestone } from '@modules/Quotation/types';
import { MilestoneStatus } from '@helpers/commonEnums';
import { InvoiceDrawerTypes } from '@organisms/Invoice/Drawer/types';
import { formatCurrency, handleError } from '@helpers/common';
import { QuotationModule } from '@modules/Quotation';

interface MilestonesAndInvoicesProps {
  item: QuotationTypes
  /** The function to set the drawer state */
  setDrawer: Dispatch<SetStateAction<InvoiceDrawerTypes>>
  onRefresh: <QueryType = any>(query?: QueryType) => void
}

const MilestonesAndInvoices: FC<MilestonesAndInvoicesProps> = (props) => {
  const { item, setDrawer, onRefresh } = props;
  const { QuotationMilestone } = item;

  // console.log('QuotationMilestone', QuotationMilestone)
  // console.log('item', item)

  const allCompletedIds = useMemo(() => {
    const ids: number[] = []
    QuotationMilestone?.forEach((milestone) => {
      if (milestone?.status !== MilestoneStatus['Not Completed']) {
        ids.push(milestone?.id)
      }
    })
    return ids
  }, [QuotationMilestone])

  const [selected, setSelected] = useState<{
    open: boolean; ids: number[]
    completedIds?: number[]
  }>({
    open: false, ids: [],
    completedIds: allCompletedIds
  })
  const module = useMemo(() => new QuotationModule(), [])

  const checkUncheck = (id: number) => {
    const ids = selected.ids.filter((key) => key !== id)
    setSelected((prev) => ({ ...prev, open: false, ids }))
  }

  const onCompleteMilestone = (id: number) => {
    module.completeMilestone(id).then((res) => {
      message.success(res?.data?.message || 'Milestone completed successfully')
      //remove it from the ids and add it to the completedIds
      const ids = selected.ids.filter((key) => key !== id)
      setSelected((prev) => ({ ...prev, open: false, ids, completedIds: [...prev.completedIds!, id] }))
      onRefresh()
    }).catch((err) => {
      const errMessage = handleError(err)
      message.error(errMessage || 'Something went wrong')
    })
  }

  const columns: ColumnsType<QuotationMilestone> = [
    {
      title: '',
      dataIndex: 'id',
      key: 'id',
      render(id: number, _record, index) {
        return (
          <div className='d-flex align-items-center'>
            {item.projectId ? (
              <>
                {selected.completedIds?.includes(id) ? (
                  <Tooltip title="This milestone is already completed">
                    <CheckOutlined
                      style={{ color: 'var(--color-primary-main)' }}
                    />
                  </Tooltip>
                ) : (
                  <Popconfirm
                    title="This will mark the milestone as completed. Are you sure?"
                    okText="Yes" cancelText="No" zIndex={9999}
                    onConfirm={() => {
                      checkUncheck(id)
                      onCompleteMilestone(id)
                    }}
                    onCancel={() => checkUncheck(id)}
                    onOpenChange={(open) => {
                      if (!open) {
                        checkUncheck(id)
                      }
                    }}
                  >
                    <Checkbox
                      checked={selected.ids.includes(id)}
                      onChange={() => setSelected((prev) => ({ ...prev, open: true, ids: [...prev.ids, id] }))}
                      disabled={selected.completedIds?.includes(id)}
                      defaultChecked={selected.completedIds?.includes(id)}
                    />
                  </Popconfirm>
                )}
              </>
            ) : (
              <span>{index + 1}.</span>
            )}
          </div>
        )
      },
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render(value: string) {
        return (
          <div className='d-flex align-items-center'>
            <span>{value}</span>
          </div>
        )
      },
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render(value: number) {
        return <span>{formatCurrency(value)}</span>
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render(status: number, record) {
        return (
          <>
            <span>{MilestoneStatus[status]}</span>
            {status === MilestoneStatus.Completed && (
              <div>
                <Button
                  type="ghost" size='small'
                  style={{
                    fontSize: '0.7rem',
                    borderColor: 'var(--color-primary-main)',
                    color: 'var(--color-primary-main)'
                  }}
                  onClick={() => {
                    setDrawer({
                      type: 'create', open: true,
                      quotation: item,
                      id: record.invoiceId,
                      projectId: item.projectId,
                    })
                  }}
                >
                  Create Invoice
                </Button>
              </div>
            )}

            {status === MilestoneStatus['Invoice Generated'] && (
              <div>
                <Button
                  type="ghost" size='small'
                  style={{
                    fontSize: '0.7rem',
                    borderColor: 'var(--color-primary-main)',
                    color: 'var(--color-primary-main)'
                  }}
                  onClick={() => {
                    setDrawer({
                      open: true, type: 'preview',
                      quotation: item,
                      id: record.invoiceId,
                      projectId: item.projectId,
                    })
                  }}
                >
                  Submit Invoice
                </Button>
              </div>
            )}
          </>
        )
      }
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={QuotationMilestone || []}
      pagination={false}
    />
  )
}

export default MilestonesAndInvoices;