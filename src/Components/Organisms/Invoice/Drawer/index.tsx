import { FC, useEffect, useMemo, useState } from 'react';
import {
  Alert, Button, Card, Checkbox, Col, DatePicker, Drawer, Form, Input, InputNumber,
  Popconfirm, Radio, Row, Space, Table, Tooltip, message
} from 'antd';
import { ColumnsType } from 'antd/es/table';
import { CheckOutlined, PlusOutlined, CloseOutlined } from '@ant-design/icons';
import {
  Typography, ImageUploader, CustomInput, SelectWithSearch,
  CustomSelect, DropdownWithLabel, CustomButton
} from '@atoms/';
import PreviewFile from '@atoms/PreviewFile';
import { InvoiceStatus, InvoiceTypeEnum, MilestoneStatus } from '@helpers/commonEnums';
import { formatCurrency, handleError } from '@helpers/common';
import { QuotationMilestone, QuotationTypes } from '@modules/Quotation/types';
import { InvoiceTypes } from '@modules/Invoice/types';
import { InvoiceModule } from '@modules/Invoice';
import {
  InvoiceDrawerFormType, InvoiceItemsTypes, InvoiceDrawerProps, TotalTypes,
  SearchedResultTypes
} from './types';
import style from './styles.module.scss';
import { useDebounce } from '@helpers/useDebounce';
import { ProjectTypes } from '@modules/Project/types';
import { ProjectModule } from '@modules/Project';
import { QuotationModule } from '@modules/Quotation';
import InvoiceStatusComp from '../status';
import { BrandingThemeModule } from '@modules/BrandingTheme';
import { ProductModule } from '@modules/Product';
import { AccountModule } from '@modules/Account';
import { TaxRateModule } from '@modules/TaxRate';
import {
  useCalculateTotal, useCheckForDuplicateInvoiceNumber, useGetOptions, useInvoiceNumber,
  useMarkAsSent, useProjectSearch, useSubmitInvoice, useMilestoneSelection
} from './hooks';
import { datePresets, getLineTotal, initialInvoiceValue, invoiceItemColumns } from './helpers';
import { getOptionsFromEnum } from '@helpers/options';
import moment from 'moment';

const { TextArea } = Input;

const InvoiceDrawer: FC<InvoiceDrawerProps> = (props) => {
  const { setDrawer, drawer, onRefresh, permissions } = props;

  const { id: invoiceId, quotation, type, projectId } = drawer;

  const module = useMemo(() => new InvoiceModule(), [])
  const projectModule = useMemo(() => new ProjectModule(), []);
  const quotationModule = useMemo(() => new QuotationModule(), []);
  const brandingThemeModule = useMemo(() => new BrandingThemeModule(), [])
  const productModule = useMemo(() => new ProductModule(), [])
  const accountModule = useMemo(() => new AccountModule(), [])
  const taxRateModule = useMemo(() => new TaxRateModule(), [])

  const [form] = Form.useForm<InvoiceDrawerFormType>();

  const [QuotationMilestone, setQuotationMilestone] = useState<QuotationMilestone[]>(() => {
    return quotation?.QuotationMilestone || []
  })

  const allCompletedIds = useMemo(() => {
    const ids: number[] = []
    QuotationMilestone?.forEach((milestone) => {
      if (milestone?.status === MilestoneStatus['Invoice Paid']) {
        ids.push(milestone?.id)
      }
    })
    return ids
  }, [QuotationMilestone])

  const dataSource = useMemo(() => {
    const supervision: QuotationMilestone = {
      id: 0, title: "Supervision Charge",
      amount: quotation?.supervisionMonthlyCharge!,
      quotationId: quotation?.id!,
      status: 0, invoiceId: 0,
      type: "supervision",
      quantity: 1,
    }

    if (quotation?.hasSupervision) {
      // if supervision is not added to the milestones, add it else don't add it again
      if (!QuotationMilestone?.find((milestone) => milestone?.type === "supervision")) {
        QuotationMilestone?.push(supervision)
      }
    }
    return QuotationMilestone || []
  }, [QuotationMilestone, quotation])

  // Invoice Number State (for tracking the invoice number changes)
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceType, setInvoiceType] = useState(InvoiceTypeEnum.Auto);
  // Project Searched Result
  const [projects, setProjects] = useState<SearchedResultTypes<ProjectTypes>>({ data: [], loading: false })
  // Fetch Quotations
  const [fetchedQuotations, setFetchedQuotations] = useState<QuotationTypes[]>([])
  // Supervision Checkbox
  const [checked, setChecked] = useState(false);
  const [previewData, setPreviewData] = useState<InvoiceTypes>();
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState<TotalTypes>({ subtotal: 0, total: 0 })
  const [selectedMilestones, setSelectedMilestones] = useState<{ ids: number[]; completedIds: number[] }>({
    ids: [], completedIds: allCompletedIds
  })
  // Date Picker
  const [openDate, setOpenDate] = useState({ issueDate: false, expiryDate: false })
  // Project Search Term
  const [projectSearchTerm, setSearchProjectTerm] = useState("");
  const debouncedProjectSearchTerm = useDebounce(projectSearchTerm, 500);

  const onClose = () => {
    setDrawer((prev) => ({ ...prev, open: false, quoteId: undefined }))
    setSelectedMilestones({ ids: [], completedIds: allCompletedIds })
    setIsLoading(false);
    setChecked(false);
    form.resetFields();
  }

  const successCallback = () => {
    setChecked(false);
    onClose();
  }

  // Unique Invoice Number
  const InvoiceNumber = useInvoiceNumber({ type, module, form, previewData: previewData! })
  // Check for duplicate quote number
  useCheckForDuplicateInvoiceNumber({ type, module, form, invoiceNumber, previewData: previewData! })
  // Calculate Total
  // Project Search
  const { onProjectSearch } = useProjectSearch({ projectModule, setProjects, debouncedProjectSearchTerm })

  // Mark Invoice as Sent
  const markAsSent = useMarkAsSent({ module, permissions, onRefresh, successCallback })

  // Submit Invoice
  const onSubmitInvoice = useSubmitInvoice({
    module, permissions, onRefresh, successCallback, setIsLoading, previewData: previewData!
  })

  /** Get options Data */
  const { productData, accountData, taxRateData } = useGetOptions({
    type, modules: { brandingThemeModule, productModule, accountModule, taxRateModule }
  })

  const onCalculateTotal = useCalculateTotal({ form, setTotal, taxRateData: taxRateData! })

  const { checkUncheck, checkUncheckSupervision } = useMilestoneSelection({
    QuotationMilestone, form, selectedMilestones, setSelectedMilestones, onCalculateTotal,
    setChecked, quotation: quotation!
  })

  /** This function is used to remove the invoice items that was added from the quotation milestones */
  const onUpdateInvoiceItems = () => {
    const invoiceItems: InvoiceDrawerFormType['invoiceItems'] = form.getFieldValue('invoiceItems');
    const newInvoiceItems = invoiceItems.filter((item) => {
      if (item?.id) return false
      return true
    });

    if (newInvoiceItems.length === 0) {
      form.setFieldsValue({ invoiceItems: [{ title: "", amount: null, quantity: 1 }] })
    } else {
      form.setFieldsValue({ invoiceItems: newInvoiceItems })
    }
  }

  /** This function is used to remove the invoice item */
  const onRemoveItem = (remove: (idx: number) => void, index: number) => {
    // remove from selected ids if it was selected
    setSelectedMilestones({
      ...selectedMilestones,
      ids: selectedMilestones.ids.filter((id) => id !== index)
    });
    let deletedItem = form.getFieldValue(["invoiceItems", index, "id"]);
    if (deletedItem) {
      setSelectedMilestones((prev) => ({
        ...prev,
        ids: prev.ids.filter((milestoneId) => milestoneId !== deletedItem),
      }))
    }
    remove(index);
    onCalculateTotal();
  }

  /**This function is used to create invoice for the quotation 
   * @param values InvoiceDrawerFormType
   */
  const onCreateOrEditInvoice = (values: InvoiceDrawerFormType) => {
    setIsLoading(true);
    const formData = new FormData();

    const file = values?.file?.file
    if (file) {
      formData.append("file", file);
    }

    const finalValues = {
      ...values,
      file: formData.get("file"),
      quotationId: values?.quotationId || quotation?.id!,
      expiryDate: values?.expiryDate?.format("YYYY-MM-DD"),
      issueDate: values?.issueDate?.format("YYYY-MM-DD"),
    }

    if (!finalValues?.file && finalValues?.type === InvoiceTypeEnum.Manual) {
      message.error("Please upload invoice file");
      setIsLoading(false);
      return;
    }

    switch (type) {
      case "create": {
        if (permissions.createInvoice === true) {
          module?.createRecord(finalValues).then((res) => {
            const data = res?.data?.data;

            if (data?.file) {
              setPreviewData(data);
            }
            message.success("Invoice created successfully");
            onRefresh();
            setDrawer((prev) => ({ ...prev, type: "preview" }));
          }).catch((err) => {
            const errMessage = handleError(err)
            message.error(errMessage || "Something went wrong")
          }).finally(() => {
            setIsLoading(false);
          })
        } else {
          message.error("You don't have permission to create invoice");
          setIsLoading(false);
        }
        break;
      }
      case "edit": {
        if (!previewData?.id) return message.error("Invoice not found");

        module?.updateRecord(finalValues, previewData?.id).then((res) => {
          const data = res?.data?.data;

          if (data?.file) {
            setPreviewData(data);
          }
          message.success("Invoice updated successfully");
          onRefresh();
          setDrawer((prev) => ({ ...prev, type: "preview" }));
        }).catch((err) => {
          const errMessage = handleError(err)
          message.error(errMessage || "Something went wrong");
        }).finally(() => {
          setIsLoading(false);
        })
        break;
      }
      default: {
        message.error("Something went wrong");
        setIsLoading(false);
        break;
      }
    }
  }

  /** Get all the quotations for the selected project
   * @param projectId - Project Id
   */
  const onGetQuotations = (projectId: number, quoteNumber?: string) => {
    if (!projectId) return;
    const { getAllRecords } = quotationModule;
    getAllRecords({ projectId, quoteNumber: quoteNumber || undefined }).then((res) => {
      const data = res?.data?.data;
      if (data) {
        if (quoteNumber) {
          setFetchedQuotations((prev) => [...prev, ...data])
        } else {
          setFetchedQuotations(data)
        }
      }
    }).catch((err) => {
      const errorMessage = handleError(err)
      message.error(errorMessage || "Something went wrong, please try again later.")
    })
  }

  // Get the invoice type options from the enum
  const options = getOptionsFromEnum(InvoiceTypeEnum)

  /** This function is used to render the table for the milestones */
  const milestonesTable = () => {
    const columns: ColumnsType<QuotationMilestone> = [
      {
        title: '',
        dataIndex: 'id',
        key: 'id',
        render(id: number, record) {
          return (
            <div className='d-flex align-items-center'>
              {record.type === "supervision" ? (
                <Checkbox
                  checked={checked} className='mb-2'
                  style={{ transform: 'scale(1.5)' }}
                  onChange={(event) => checkUncheckSupervision(event)}
                />
              ) : (
                <>
                  {selectedMilestones.completedIds?.includes(id) ? (
                    <Tooltip
                      title="This milestone is already completed"
                      zIndex={10001}
                    >
                      <CheckOutlined
                        style={{ color: 'var(--color-primary-main)', transform: 'scale(1.5)' }}
                      />
                    </Tooltip>
                  ) : (
                    <Checkbox
                      checked={selectedMilestones.ids.includes(id)}
                      style={{ transform: 'scale(1.5)' }}
                      onChange={(event) => checkUncheck(id, event.target.checked)}
                    />
                  )}
                </>
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
          return (
            <span>{value} AED</span>
          )
        }
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render(status: number, record) {
          return (
            <>
              {record?.type !== "supervision" && (
                <span>{MilestoneStatus[status]}</span>
              )}
            </>
          )
        }
      },
    ];

    return (
      <>
        <Typography color='dark-main' className='mb-2'>
          Select the milestones you want to add to the invoice
        </Typography>
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          rowKey={(record) => record.id}
          scroll={{ x: 500 }}
        />
      </>
    )
  }

  useEffect(() => {
    setSelectedMilestones((prev) => ({ ...prev, completedIds: allCompletedIds }))
  }, [allCompletedIds])

  useEffect(() => {
    onProjectSearch();
  }, [debouncedProjectSearchTerm])

  // in edit, check the milestones that are already added to the invoice
  useEffect(() => {
    if (type === "edit") {
      const invoiceItems: InvoiceDrawerFormType['invoiceItems'] = form.getFieldValue('invoiceItems');
      const ids = invoiceItems?.map((item) => item?.id) as number[];
      setSelectedMilestones((prev) => ({ ...prev, ids: ids || [] }))
    }
  }, [type])

  useEffect(() => {
    if (type !== "create" && invoiceId) {
      module.getRecordById(invoiceId).then((res) => {
        const data = res?.data?.data;
        setPreviewData(data);

        setQuotationMilestone(data?.Quotation?.QuotationMilestone || [])

        if (type === "edit") {
          form.setFieldsValue({
            ...data,
            invoiceItems: data?.InvoiceItems,
            type: data?.type,
          })

          onCalculateTotal();
        }
      })
    }
  }, [invoiceId, type])

  useEffect(() => {
    if (type === "edit" && taxRateData) {
      onCalculateTotal();
    }
  }, [taxRateData])

  // Fetch the quotations and the project for the selected project when there is a project id
  useEffect(() => {
    const condition = (type === "create" || type === "edit") && (projectId || previewData?.projectId)
    if (condition) {
      projectModule.getRecordsInList({ ids: [projectId!] }).then((res) => {
        const data = res?.data?.data;
        setProjects((prev) => {
          // if the data is already present in the state, then don't add it again
          const filteredData = data?.filter((item) => {
            return !prev?.data?.find((prevItem) => prevItem.id === item.id);
          });
          // add the new data to the existing data
          return { data: [...prev.data, ...filteredData], loading: false };
        })

        form.setFieldValue("projectId", projectId || previewData?.projectId)
      })

      onGetQuotations(projectId!, String(previewData?.Quotation?.id || ""))
    }
  }, [projectId, type, previewData?.projectId])

  /** Drawer Extra */
  const drawerExtra = (
    <Space>
      {(type === "create" || type === "edit") && (
        <Button
          type="primary" onClick={() => form.submit()}
          loading={isLoading}
        >
          Preview
        </Button>
      )}

      {type === "preview" && (
        <>
          {previewData?.status === InvoiceStatus.Generated && (
            <>
              <Button
                type="link" style={{ color: "var(--color-dark-main)" }}
                onClick={() => setDrawer((prev) => ({ ...prev, type: "edit", id: previewData?.id }))}
              >
                Edit
              </Button>
              <Popconfirm
                title={(
                  <>
                    An email will be sent to the client. A copy of it will be sent to you as well.
                    <br />
                    Are you sure you want to submit this invoice?
                  </>
                )}
                okText="Yes" cancelText="No" placement='bottomRight'
                onConfirm={onSubmitInvoice}
                okButtonProps={{ loading: isLoading }}
                zIndex={99999}
              >
                <DropdownWithLabel
                  trigger={["click"]} size='middle' type="primary"
                  label={"Submit"} overlayStyle={{ zIndex: 10000 }}
                  items={[{ label: "Mark as sent", value: "1" }].map((option, index) => {
                    return {
                      key: `option-${index}`,
                      label: option.label,
                      onClick: () => markAsSent(previewData?.id)
                    }
                  })}
                />
              </Popconfirm>
            </>
          )}
        </>
      )}

      {(previewData?.status === InvoiceStatus.Paid || previewData?.status === InvoiceStatus.Canceled) && (
        <div>
          {InvoiceStatus[previewData?.status]}
        </div>
      )}

      {previewData?.status === InvoiceStatus.Sent && (
        <InvoiceStatusComp
          item={previewData}
          setDrawer={setDrawer}
          onRefresh={onRefresh}
          permissions={permissions}
        />
      )}
    </Space>
  )

  return (
    <Drawer
      width={window.innerWidth > 1300 ? 1300 : "100%"}
      onClose={onClose} open={drawer.open}
      destroyOnClose zIndex={9999}
      title={(
        <>
          {type === "create" && "Create Invoice"}
          {type === "edit" && `Editing Invoice of ${previewData?.Client?.name || ""} - ${previewData?.invoiceNumber || ""}`}
          {type === "preview" && `Preview Invoice of ${previewData?.Client?.name || ""} - ${previewData?.invoiceNumber || ""}`}
        </>
      )}
      bodyStyle={{
        padding: (type === "create" || type === "edit") ? 25 : 0,
        paddingTop: 0,
      }}
      extra={drawerExtra}
    >
      {(type === "create" || type === "edit") && (
        <>
          <Form
            form={form}
            onFinish={(values) => {
              const finalValues: InvoiceDrawerFormType = {
                ...values,
                type: values.type || InvoiceTypeEnum.Auto,
                hasSupervisionCharge: checked,
                projectId: quotation?.projectId! || values.projectId,
                milestoneIds: selectedMilestones.ids,
              }

              // remove id from invoice items
              finalValues.invoiceItems = finalValues.invoiceItems?.map((item) => {
                return { ...item, id: undefined }
              })

              onCreateOrEditInvoice(finalValues);
            }}
          >
            <div>
              <Row gutter={[10, 10]}>
                <Col span={(window.innerWidth > 1300 && !quotation?.id) ? 6 : 24}>
                  <Form.Item
                    name="invoiceNumber" initialValue={InvoiceNumber}
                    rules={[{ required: true, message: 'Please enter invoice number!' }]}
                    style={{ marginBottom: 0 }}
                  >
                    <CustomInput
                      label='Invoice Number' asterisk
                      placeHolder='Invoice Number' size='w100'
                      style={{ marginTop: 1 }}
                      onChange={(e: any) => {
                        const value = e?.target?.value;
                        setInvoiceNumber(value);
                      }}
                    />
                  </Form.Item>
                </Col>

                {!quotation?.id && (
                  <Col span={window.innerWidth > 1300 ? 6 : 24}>
                    <Form.Item
                      name="projectId" style={{ marginBottom: 0 }}
                      rules={[{ required: true, message: "Please select a project" }]}
                    >
                      <SelectWithSearch
                        label='Project'
                        loading={projects?.loading}
                        onSearch={(value) => setSearchProjectTerm(value)}
                        options={projects?.data?.map((item) => ({
                          label: `${item.referenceNumber} | ${item.title}`,
                          value: item.id,
                        }))}
                        onSelect={(value) => {
                          onGetQuotations(value)
                          // reset the quotation id
                          form.setFieldsValue({ quotationId: undefined })
                          // reset the quotation milestones
                          setQuotationMilestone([])
                          // remove the invoice items that was added from the quotation milestones
                          setSelectedMilestones((prev) => ({ ...prev, ids: [] }))
                          onUpdateInvoiceItems()
                          onCalculateTotal();
                        }}
                      />
                    </Form.Item>
                  </Col>
                )}

                <Col span={window.innerWidth > 1300 ? 6 : 24}>
                  <label className={"font-size-sm color-dark-main"}>Issue Date</label>
                  <Form.Item
                    name="issueDate" initialValue={moment()}
                    style={{ marginBottom: 0 }}
                  >
                    <DatePicker
                      placeholder='Issue Date' className={style.date_picker} popupClassName={style.z_index}
                      open={openDate.issueDate} showToday={false}
                      onOpenChange={(status) => setOpenDate((prev) => ({ ...prev, issueDate: status }))}
                      renderExtraFooter={() => (
                        <div className={style.date_footer}>
                          {/** Custom Issue Date */}
                          {datePresets.map((days) => (
                            <Button
                              key={days} type="ghost" size="small"
                              onClick={() => {
                                const date = moment().subtract(days, 'days');
                                form.setFieldsValue({ issueDate: date });
                                setOpenDate((prev) => ({ ...prev, issueDate: false }))
                              }}
                            >
                              {days} days ago
                            </Button>
                          ))}
                        </div>
                      )}
                    />
                  </Form.Item>
                </Col>

                <Col span={window.innerWidth > 1300 ? 6 : 24}>
                  <label className={"font-size-sm color-dark-main"}>Expiry Date</label>
                  <Form.Item
                    name="expiryDate" initialValue={moment().add(14, 'days')}
                    style={{ marginBottom: 5 }}
                  >
                    <DatePicker
                      placeholder='Expiry Date' className={style.date_picker} popupClassName={style.z_index}
                      open={openDate.expiryDate} showToday={false}
                      onOpenChange={(status) => setOpenDate((prev) => ({ ...prev, expiryDate: status }))}
                      renderExtraFooter={() => (
                        <div className={style.date_footer}>
                          {/** Custom Expiry Date */}
                          {datePresets.map((days) => (
                            <Button
                              key={days} type="ghost" size="small"
                              onClick={() => {
                                const date = moment().add(days, 'days');
                                form.setFieldsValue({ expiryDate: date });
                                setOpenDate((prev) => ({ ...prev, expiryDate: false }))
                              }}
                            >
                              In {days} days
                            </Button>
                          ))}
                        </div>
                      )}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/** Quotation */}
            {(!quotation?.id && fetchedQuotations?.length > 0) && (
              <div>
                <Form.Item
                  name="quotationId"
                  rules={[{ required: true, message: "Please select a quotation" }]}
                >
                  <CustomSelect
                    label="Quotation" asterisk
                    options={fetchedQuotations?.map((item) => ({
                      label: item?.quoteNumber || `Quote 0${item?.id}`,
                      value: item.id,
                    }))}
                    onSelect={(value: number) => {
                      const quotation = fetchedQuotations?.find((item) => item.id === value);
                      setQuotationMilestone(quotation?.QuotationMilestone || [])
                      // remove the invoice items that was added from the quotation milestones
                      setSelectedMilestones((prev) => ({
                        ...prev, ids: [],
                      }))
                      onUpdateInvoiceItems()
                      onCalculateTotal();
                    }}
                  />
                </Form.Item>
              </div>
            )}

            <Form.Item
              name="title"
              rules={[{ required: true, message: 'Please input the title!' }]}
            >
              <CustomInput
                label={"Title"} placeHolder="Title"
                style={{ width: "100%" }} asterisk
              />
            </Form.Item>

            {QuotationMilestone?.length > 0 && (
              <div className="my-5">
                {milestonesTable()}
              </div>
            )}

            <Form.List name="invoiceItems" initialValue={initialInvoiceValue}>
              {(fields, { add, remove }) => (
                <Card
                  size="small" className={"mb-2 w-100"}
                  headStyle={{ padding: "0px 0.5rem", margin: 0, backgroundColor: "var(--color-light" }}
                  bodyStyle={{ overflowX: "auto", overflowY: "hidden" }}
                  title={
                    <div className={"d-flex justify-space-between align-center w-100"}>
                      <Typography color="dark-main" size="sm" weight='semi'>
                        Invoice Items
                      </Typography>
                      <span
                        className='font-weight-semi font-size-sm color-dark-main cursor-pointer'
                        onClick={() => add()}
                      >
                        <PlusOutlined /> Add More
                      </span>
                    </div>
                  }
                >
                  <Row
                    gutter={[10, 10]}
                    style={{ minWidth: 1300, overflowX: "auto", overflowY: "hidden" }}
                  >
                    {invoiceItemColumns.map((item, index) => (
                      <Col span={item.span} key={`invoiceItem-${index}`} style={item.style}>
                        <Typography color="dark-main" size="normal">
                          {item.title}
                        </Typography>
                      </Col>
                    ))}
                  </Row>

                  {fields.map(({ key, name, ...restField }) => (
                    <Row
                      key={key} gutter={[10, 10]}
                      style={{ minWidth: 1300, overflowX: "auto", overflowY: "hidden" }}
                    >
                      <Col span={4}>
                        <Form.Item
                          {...restField} name={[name, "productId"]} initialValue={undefined}
                          style={{ width: "100%", marginBottom: 0, marginTop: name === 0 ? 0 : 10 }}
                        >
                          <CustomSelect
                            options={productData?.map((item) => ({
                              label: `${item.productCode} - ${item.title}`, value: item.id
                            }))}
                            placeholder="Select Product"
                            onSelect={(value) => {
                              const product = productData?.find((item) => item.id === value);
                              const invoiceData: InvoiceItemsTypes[] = form.getFieldValue("invoiceItems");
                              const invoice = invoiceData[name]

                              if (product) {
                                invoice.amount = product.unitPrice;
                                invoice.taxRateId = product.taxRateId;
                                invoice.accountId = product.accountId;
                                invoice.title = product.title;
                                invoice.quantity = product.quantity || 1;
                              }
                              form.setFieldsValue({ invoiceItems: invoiceData })
                              onCalculateTotal()
                            }}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={5}>
                        <Form.Item
                          {...restField} name={[name, "title"]} initialValue={""}
                          rules={[{ required: true, message: "Missing item title" }]}
                          style={{ width: "100%", marginBottom: 0, marginTop: name === 0 ? 0 : 10 }}
                        >
                          <TextArea
                            placeholder='Title' className={style.gen_border}
                            autoSize={{ minRows: 1, maxRows: 3 }}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={2}>
                        <Form.Item
                          {...restField} name={[name, "quantity"]} initialValue={1}
                          rules={[
                            { required: true, message: "Missing item quantity", },
                            { pattern: /^[0-9]+$/, message: "Only whole numbers are allowed" }
                          ]}
                          style={{ width: "100%", marginBottom: 0, marginTop: name === 0 ? 0 : 10 }}
                        >
                          <InputNumber
                            placeholder='Quantity'
                            style={{ width: "100%" }} className={style.gen_border}
                            onChange={onCalculateTotal}
                            parser={(value) => (value && value.replace(/\$\s?|(,*)/g, '')) || ''}
                            step={1} precision={0}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={3}>
                        <Form.Item
                          {...restField} name={[name, "amount"]} initialValue={""}
                          rules={[{ required: true, message: "Missing item amount" }]}
                          style={{ width: "100%", marginBottom: 0, marginTop: name === 0 ? 0 : 10 }}
                        >
                          <InputNumber
                            placeholder='Unit Amount' style={{ width: "100%" }} className={style.gen_border}
                            onChange={onCalculateTotal}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={4}>
                        <Form.Item
                          {...restField} name={[name, "accountId"]} initialValue={undefined}
                          style={{ width: "100%", marginBottom: 0, marginTop: name === 0 ? 0 : 10 }}
                        >
                          <CustomSelect
                            options={accountData?.map((item) => ({
                              label: `${item.accountCode} - ${item.title}`,
                              value: item.id,
                            }))}
                            placeholder="Select Account"
                          />
                        </Form.Item>
                      </Col>

                      <Col span={2}>
                        <Form.Item
                          {...restField} name={[name, "taxRateId"]} initialValue={undefined}
                          style={{ width: "100%", marginBottom: 0, marginTop: name === 0 ? 0 : 10 }}
                        >
                          <CustomSelect
                            style={{ width: 130 }} placeholder="Select Tax Rate"
                            dropdownStyle={{ zIndex: 10000 }}
                            options={taxRateData?.map((item) => ({
                              label: item.title, value: item.id,
                            }))}
                            onSelect={onCalculateTotal}
                          />
                        </Form.Item>
                      </Col>

                      <Col
                        span={3}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "center",
                          marginTop: name === 0 ? 0 : 10
                        }}
                      >
                        <Typography color="dark-main" size="sm" weight='semi'>
                          {`${getLineTotal(form.getFieldValue(["invoiceItems", name, "quantity"]), form.getFieldValue(["invoiceItems", name, "amount"]))}`}
                        </Typography>
                      </Col>

                      <Col span={1}>
                        {name !== 0 && (
                          <CustomButton
                            type="danger" size="normal" fontSize="sm"
                            disabled={name === 0 ? true : false}
                            onClick={() => onRemoveItem(remove, name)}
                            style={{ marginTop: name === 0 ? 0 : 10 }}
                          >
                            <CloseOutlined />
                          </CustomButton>
                        )}
                      </Col>
                    </Row>
                  ))}
                </Card>
              )}
            </Form.List>

            {/** Total */}
            <Card className={style.total}>
              <div className={style.total_item}>
                <Typography color="dark-main" size="sm">
                  Subtotal
                </Typography>
                <Typography color="dark-main" size="sm">
                  {formatCurrency(total.subtotal)}
                </Typography>
              </div>

              {(total.vatData && Array.from(total.vatData).map(([keys, ele]) => {
                return (
                  <div key={`VAT_DATA${keys}`} className={style.total_item}>
                    <Typography color="dark-main" size="sm">
                      {`${ele.title} (${ele.vatRate}%)`}
                    </Typography>
                    <Typography color="dark-main" size="sm">
                      {formatCurrency(ele.totalVat)}
                    </Typography>
                  </div>
                )
              }))}

              <div className={style.total_item}>
                <Typography color="dark-main" size="sm" weight='bolder'>
                  Total
                </Typography>
                <Typography color="dark-main" size="sm" weight='bolder'>
                  {formatCurrency(total.total)}
                </Typography>
              </div>
            </Card>

            {/** Invoice Type */}
            <Form.Item
              name="type" style={{ marginBottom: 5, marginTop: 20 }}
              label="Invoice Type" initialValue={invoiceType}
            >
              <Radio.Group
                name="type" buttonStyle="solid"
                onChange={(e) => setInvoiceType(e.target.value)}
              >
                {options.map((option) => (
                  <Radio.Button
                    key={`invoiceType-${option.value}`}
                    value={Number(option.value)}
                  >
                    {option.label}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </Form.Item>

            {invoiceType === InvoiceTypeEnum.Auto && (
              <Alert
                message="System will automatically generate invoice based on the above information"
                type="warning" style={{ marginTop: 15 }}
              />
            )}

            {invoiceType === InvoiceTypeEnum.Manual && (
              <ImageUploader name="file" />
            )}
          </Form>
        </>
      )}

      {type === "preview" && (
        <PreviewFile
          file={previewData?.file!} loading={!previewData}
          tip='Please wait while we are preparing the invoice...'
        />
      )}
    </Drawer>
  );
};

export default InvoiceDrawer;