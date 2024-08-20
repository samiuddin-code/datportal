import { FC, useEffect, useMemo, useState } from 'react';
import {
  Alert, Button, Card, Checkbox, Col, Collapse, DatePicker, Drawer, Form,
  Input, InputNumber, Popconfirm, Radio, Row, Select, Space, Spin, Tooltip, message
} from 'antd';
import { PlusOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';
import {
  Typography, CustomButton, ImageUploader, CustomSelect, SelectWithSearch,
  DropdownWithLabel, CustomInput,
} from '@atoms/';
import {
  CreateOrReviseType, PullFromXeroType, QuotationDrawerFormType, TotalTypes,
  QuotationDrawerProps, SearchedResultTypes, SupervisionLabelType, Milestone,
} from './types';
import {
  QuotationStatus, QuotationTypeEnum, SupervisionPaymentSchedule
} from '@helpers/commonEnums';
import { formatCurrency, handleError } from '@helpers/common';
import { QuotationTypes } from '@modules/Quotation/types';
import { QuotationModule } from '@modules/Quotation';
import { OrganizationModule } from '@modules/Organization';
import { OrganizationType } from '@modules/Organization/types';
import { useFetchData } from 'hooks';
import PreviewFile from '@atoms/PreviewFile';
import CustomTextArea from '@atoms/Input/textarea';
import { useDebounce } from '@helpers/useDebounce';
import { ProjectTypes } from '@modules/Project/types';
import { ProjectModule } from '@modules/Project';
import { XeroModule } from '@modules/Xero';
import QuotationStatusComp from '../status';
import style from './styles.module.scss';
import { PROTECTED_RESOURCE_BASE_URL } from '@helpers/constants';
import TokenService from '@services/tokenService';
import {
  useCalculateTotal, useCheckForDuplicateQuoteNumber, useGetOptions, useMarkAsSent,
  useProjectSearch, usePullFromXero, useQuoteNumber, useSubmitQuotation
} from './hooks';
import { PaymentScheduleOptions, QuotationTypeOptions } from '@helpers/options';
import { BrandingThemeModule } from '@modules/BrandingTheme';
import { ProductModule } from '@modules/Product';
import moment from 'moment';
import {
  datePresets, getLineTotal, initialMilestoneValue, quotationItemColumns
} from './helpers';
import { AccountModule } from '@modules/Account';
import { TaxRateModule } from '@modules/TaxRate';
import { LeadsTypes } from '@modules/Leads/types';
import FilesDrawer from '@organisms/Leads/FileManagement';

const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;

const QuotationDrawer: FC<QuotationDrawerProps> = (props) => {
  const { drawer, setDrawer, permissions, onRefresh, setNewProject } = props;
  const { type, quoteId, submissionById, leadId } = drawer;
  const access_token = TokenService.getLocalAccessToken();

  const module = useMemo(() => new QuotationModule(), [])
  const orgModule = useMemo(() => new OrganizationModule(), []);
  const projectModule = useMemo(() => new ProjectModule(), []);
  const xeroModule = useMemo(() => new XeroModule(), [])
  const brandingThemeModule = useMemo(() => new BrandingThemeModule(), [])
  const productModule = useMemo(() => new ProductModule(), [])
  const accountModule = useMemo(() => new AccountModule(), [])
  const taxRateModule = useMemo(() => new TaxRateModule(), [])

  const [form] = Form.useForm<QuotationDrawerFormType>();

  const { data: orgData } = useFetchData<OrganizationType[]>({
    method: orgModule.findPublished,
  })

  const [previewData, setPreviewData] = useState<QuotationTypes>();
  const [isLoading, setIsLoading] = useState(false);
  // Pull from Xero states
  const [pullFromXero, setPullFromXero] = useState<Partial<PullFromXeroType>>({
    data: undefined, init: false, loading: false, quoteNumber: "", xeroTenantId: ""
  })
  // Quote Number State (for tracking the quote number changes)
  const [quoteNumber, setQuoteNumber] = useState("");
  // Quotation Type States
  const [quotationType, setQuotationType] = useState(QuotationTypeEnum.Auto);
  // Supervision Checkbox State
  const [checked, setChecked] = useState(false);
  // Project Searched Result States
  const [projects, setProjects] = useState<SearchedResultTypes<ProjectTypes>>({ data: [], loading: false })
  // Total Amount States
  const [total, setTotal] = useState<TotalTypes>({ subtotal: 0, total: 0, supervisionMonthlyCharge: 0 })
  // Supervision Schedule States
  const [supervisionSchedule, setSupervisionSchedule] = useState<SupervisionLabelType>('End of the Month');
  // Project Search Term
  const [projectSearchTerm, setSearchProjectTerm] = useState("");
  const debouncedProjectSearchTerm = useDebounce(projectSearchTerm, 500);
  // Date Picker
  const [openDate, setOpenDate] = useState({ issueDate: false, expiryDate: false })

  const [xeroTenants, setXeroTenants] = useState<{ tenantName: string, tenantId: string }[]>();

  useEffect(() => {
    if (pullFromXero.init) {
      orgModule.getTenants().then((res) => {
        if (res.data && res.data?.data) {
          setXeroTenants(res.data.data);
        }
      }).catch(err => {
        console.error("Error while fetching tenants", err?.message);
      })
    }
  }, [pullFromXero.init])

  const onClose = () => {
    const defaultDrawerValues = {
      open: false, quoteId: undefined,
      leadId: undefined, submissionById: undefined
    }
    setDrawer((prev) => ({ ...prev, ...defaultDrawerValues }))
    setPreviewData(undefined);
    setIsLoading(false);
    form.resetFields();
  }

  const successCallback = () => {
    setChecked(false);
    onClose();
  }

  // Unique Quote Number
  const QuoteNumber = useQuoteNumber({ type, module, form, previewData: previewData!, drawer })
  // Check for duplicate quote number
  useCheckForDuplicateQuoteNumber({ type, module, form, quoteNumber, previewData: previewData!, drawer })
  // Pull from Xero
  const onPullFromXero = usePullFromXero({ xeroModule, setPreviewData, setDrawer, setPullFromXero, pullFromXero })
  // Calculate Total
  // Project Search
  const { onProjectSearch, fetchProjects } = useProjectSearch({ projectModule, setProjects, debouncedProjectSearchTerm })

  // Mark Quotation as Sent
  const markAsSent = useMarkAsSent({ module, permissions, onRefresh, successCallback })

  // Submit Quotation
  const onSubmitQuotation = useSubmitQuotation({
    module, permissions, onRefresh, successCallback, setIsLoading, previewData: previewData!
  })

  /** Get options Data */
  const { brandingThemeData, productData, accountData, taxRateData } = useGetOptions({
    type, modules: { brandingThemeModule, productModule, accountModule, taxRateModule },
    leadId: drawer.leadId
  })
  const onCalculateTotal = useCalculateTotal({ form, setTotal, taxRateData: taxRateData! })

  /**This function is used to create or edit quotation
   * @param values QuotationDrawerFormType
   */
  const onCreateOrEditQuotation = (values: QuotationDrawerFormType) => {
    setIsLoading(true);
    const formData = new FormData();

    const file = values?.file?.file
    if (file) {
      formData.append("file", file);
    }

    const finalLeadId = values.leadId ? values.leadId : drawer.leadId;

    const finalValues = {
      ...values, leadId: finalLeadId,
      file: formData.get("file")
    }

    if (!finalValues?.file && finalValues?.type === QuotationTypeEnum.Manual) {
      if (type === "create" || type === "revise") {
        message.error("Please upload quotation file");
        setIsLoading(false);
        return;
      }
    }

    /** This function is used to create or revise quotation */
    const onCreateOrRevise = (props: CreateOrReviseType) => {
      const { callback, extra } = props;

      module?.createRecord({ ...finalValues, ...extra }).then((res) => {
        const data = res?.data?.data;

        setDrawer((prev) => ({ ...prev, type: "preview", quoteId: data?.id }));
        onRefresh();
        callback();
      }).catch((err) => {
        const errMessage = handleError(err)
        message.error(errMessage || "Something went wrong");
      }).finally(() => {
        setIsLoading(false);
      })
    }

    switch (type) {
      case "create": {
        if (permissions?.createQuotation === true) {
          onCreateOrRevise({
            callback: () => message.success("Quotation created successfully")
          })
        } else {
          message.error("You don't have permission to create quotation");
          setIsLoading(false);
        }
        break;
      }
      case "edit": {
        if (!previewData?.id) return message.error("Quotation not found");

        if (permissions?.updateQuotation === true) {
          module?.updateRecord(finalValues, previewData?.id).then((res) => {
            const data = res?.data?.data;

            message.success("Quotation updated successfully");
            onRefresh();
            setDrawer((prev) => ({ ...prev, type: "preview", quoteId: data?.id }));
          }).catch((err) => {
            const errMessage = handleError(err)
            message.error(errMessage || "Something went wrong");
          }).finally(() => {
            setIsLoading(false);
          })
        }
        break;
      }
      case "revise": {
        if (!previewData?.id) return message.error("Quotation not found");

        if (permissions?.createQuotation === true) {
          onCreateOrRevise({
            callback: () => message.success("Quotation revised successfully"),
            extra: {
              revisedQuotationReferenceId: previewData?.id,
              leadId: previewData?.leadId
            }
          })
        } else {
          message.error("You don't have permission to revise quotation");
          setIsLoading(false);
        }
        break;
      }
      default: {
        message.error("Something went wrong");
        setIsLoading(false);
        break;
      }
    }
  }

  const [filesDrawer, setFilesDrawer] = useState<{ open: boolean; record: LeadsTypes | null }>({
    open: false, record: null
  });

  useEffect(() => {
    if (type !== "create" && quoteId) {
      module.getRecordById(quoteId).then((res) => {
        const data = res?.data?.data;
        setPreviewData(data);
        setQuotationType(data?.type);
        const projectId = data?.projectId;

        if (type !== "preview") {
          fetchProjects({ ids: [projectId] })
          form.setFieldValue("projectId", projectId)
        }

        if (type === "edit" || type === "revise") {
          form.setFieldsValue({
            ...data,
            submissionById: data?.Lead?.SubmissionBy?.id,
            scopeOfWork: data?.scopeOfWork,
            milestone: data?.QuotationMilestone,
            hasSupervision: data?.hasSupervision,
            supervisionMonthlyCharge: data?.supervisionMonthlyCharge,
            supervisionPaymentSchedule: data?.supervisionPaymentSchedule,
            paymentTerms: Array.isArray(data?.paymentTerms) ? data.paymentTerms.join(', ') : data?.paymentTerms,
            type: data?.type,
            quoteNumber: data?.quoteNumber,
            expiryDate: data?.expiryDate ? moment(data.expiryDate) : undefined,
            issueDate: data?.issueDate ? moment(data.issueDate) : undefined,
          });
        }
        
      })
    }
  }, [quoteId, type])

  useEffect(() => {
    onProjectSearch();
  }, [debouncedProjectSearchTerm])

  /** Drawer Extra */
  const drawerExtra = (
    <Space>
      {(type === "create" || type === "edit" || type === "revise") && (
        <>
          {type === "create" && (
            <Button
              size='small' type="text"
              onClick={() => {
                setPullFromXero((prev) => ({
                  ...prev, init: !prev?.init, loading: false,
                }))
              }}
            >
              {!pullFromXero?.init ? "Pull from Xero" : "Create Manually"}
            </Button>
          )}

          {!pullFromXero?.init && (
            <Button
              type="primary" onClick={() => form.submit()}
              loading={isLoading}
            >
              Preview
            </Button>
          )}
        </>
      )}

      {type === "preview" && (
        <>
          {previewData?.status === QuotationStatus.New && (
            <>
              <Button
                type="link"
                style={{ color: "var(--color-dark-main)" }}
                onClick={() => setDrawer((prev) => ({
                  ...prev, type: "edit", leadId: previewData?.leadId
                }))}
              >
                Edit
              </Button>
              <Popconfirm
                title={(
                  <>
                    An email will be sent to the client. A copy of it will be sent to you as well.
                    <br />
                    Are you sure you want to submit this quotation?
                  </>
                )}
                okText="Yes" cancelText="No" placement='bottomRight'
                onConfirm={onSubmitQuotation} zIndex={100000}
                okButtonProps={{ loading: isLoading }}
              >
                <DropdownWithLabel
                  trigger={["click"]} size='middle' type="primary"
                  label={"Submit Now"} overlayStyle={{ zIndex: 10000 }}
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

          {(previewData?.status === QuotationStatus.Confirmed || previewData?.status === QuotationStatus.Rejected) && (
            <div>
              {QuotationStatus[previewData?.status]}
            </div>
          )}

          {previewData?.status === QuotationStatus.Sent && (
            <QuotationStatusComp
              item={previewData}
              setDrawer={setDrawer}
              onRefresh={onRefresh}
              permissions={permissions}
              setNewProject={setNewProject!}
            />
          )}
        </>
      )}
    </Space>
  )

  return (
    <Drawer
      width={window.innerWidth > 1400 ? 1400 : "100%"}
      onClose={onClose} open={drawer.open} destroyOnClose={true} zIndex={10000}
      title={(
        <>
          {type === "create" && "Create Quotation"}
          {type === "edit" && `Editing Quotation of ${previewData?.Lead?.Client?.name || ""} - ${previewData?.quoteNumber || ""}`}
          {type === "preview" && `Previewing Quotation of ${previewData?.Lead?.Client?.name || ""} - ${previewData?.quoteNumber || ""}`}
          {type === "revise" && `Revising Quotation of ${previewData?.Lead?.Client?.name || ""} - ${previewData?.quoteNumber || ""}`}
        </>
      )}
      bodyStyle={{
        padding: (type === "create" || type === "edit" || type === "revise") ? 25 : 0,
        paddingTop: 0,
      }}
      extra={drawerExtra}
    >
      {(type === "create" || type === "edit" || type === "revise") ? (
        <>
          {!pullFromXero?.init ? (
            <Form
              form={form}
              onFinish={(values) => {
                const { supervisionPaymentSchedule: _supervisionPaymentSchedule, type, ...rest } = values;
                const supervisionPaymentSchedule = checked ? _supervisionPaymentSchedule || SupervisionPaymentSchedule['End of the Month'] : undefined

                const finalValues: QuotationDrawerFormType = {
                  ...rest,
                  type: type || QuotationTypeEnum.Auto,
                  hasSupervision: checked,
                  supervisionPaymentSchedule
                }
                onCreateOrEditQuotation(finalValues);
              }}
            >
              <div>
                <Row gutter={[5, 5]}>
                  <Col
                    span={(window.innerWidth > 1400 && !(previewData?.leadId || leadId)) ? 8 : 12}
                  >
                    <Form.Item
                      name="quoteNumber" initialValue={QuoteNumber} style={{ marginBottom: 0 }}
                      rules={[{ required: true, message: 'Please enter quotation number!' }]}
                    >
                      <CustomInput
                        label='Quote Number' asterisk
                        placeHolder='Quote Number' size='w100'
                        style={{ marginTop: 1 }}
                        onChange={(e: any) => {
                          const value = e?.target?.value;
                          setQuoteNumber(value);
                        }}
                      />
                    </Form.Item>
                  </Col>

                  {(!(previewData?.leadId || leadId)) && (
                    <Col span={window.innerWidth > 1400 ? 8 : 12}>
                      <Form.Item
                        name="leadId" style={{ marginBottom: 0 }}
                        rules={[{ required: true, message: "Please select a project" }]}
                      >
                        <SelectWithSearch
                          label='Project'
                          loading={projects?.loading}
                          onSearch={(value) => setSearchProjectTerm(value)}
                          options={projects?.data?.map((item) => ({
                            label: item.title,
                            value: item.leadId,
                          }))}
                        />
                      </Form.Item>
                    </Col>
                  )}

                  <Col
                    span={(window.innerWidth > 1400 && !(previewData?.leadId || leadId)) ? 8 : 12}
                  >
                    <Form.Item name="brandingThemeId" style={{ marginBottom: 0 }}>
                      <CustomSelect
                        label='Branding Theme' placeholder="Select Branding Theme"
                        options={brandingThemeData?.map((item) => ({
                          label: item.title,
                          value: item.id,
                        }))}
                        onSelect={(value) => {
                          const brandingTheme = brandingThemeData?.find((item) => item.id === value);
                          form.setFieldsValue({ paymentTerms: brandingTheme?.paymentTerms })
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              <Row gutter={[5, 5]}>
                <Col span={window.innerWidth > 1400 ? 8 : 12}>
                  <Form.Item
                    name={"submissionById"} style={{ marginBottom: 0 }}
                    initialValue={type === "create" ? submissionById : previewData?.Lead?.SubmissionBy?.id}
                    rules={[{ required: true, message: 'Please select submission by!' }]}
                  >
                    <CustomSelect
                      label="Submission By" asterisk
                      placeholder="Select Submission By"
                      options={orgData?.map((org) => {
                        return { value: org?.id || '', label: org?.name }
                      })}
                    />
                  </Form.Item>
                </Col>

                <Col span={window.innerWidth > 1400 ? 8 : 12}>
                  <label className={"font-size-sm color-dark-main"}>Issue Date</label>
                  <Form.Item
                    name="issueDate" initialValue={moment()} style={{ marginBottom: 0 }}
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

                <Col span={window.innerWidth > 1400 ? 8 : 12}>
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

              <Form.Item
                name="scopeOfWork"
                rules={[{ required: true, message: 'Please enter scope of work!' }]}
              >
                <CustomTextArea
                  label='Scope of Work' asterisk
                  autoSize={{ minRows: 3, maxRows: 10 }}
                  placeholder='Scope of Work'
                />
              </Form.Item>

              <Form.List name="milestone" initialValue={initialMilestoneValue}>
                {(fields, { add, remove }) => (
                  <Card
                    size="small" className={"mb-2 w-100"}
                    headStyle={{ padding: "0px 0.5rem", margin: 0, backgroundColor: "var(--color-light" }}
                    bodyStyle={{ overflowX: "auto", overflowY: "hidden" }}
                    title={
                      <div className={"d-flex justify-space-between align-center w-100"}>
                        <Typography color="dark-main" size="sm" weight='semi'>
                          Quotation Items
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
                      gutter={[5, 5]}
                      style={{ minWidth: 1400, overflowX: "auto", overflowY: "hidden" }}
                    >
                      {quotationItemColumns.map((item, index) => (
                        <Col span={item.span} key={`quotationItem-${index}`} style={item.style}>
                          <Typography color="dark-main" size="normal">
                            {item.title}
                          </Typography>
                        </Col>
                      ))}
                    </Row>

                    {fields.map(({ key, name, ...restField }) => (
                      <Row
                        key={key} gutter={[5, 5]}
                        style={{ minWidth: 1400, overflowX: "auto", overflowY: "hidden" }}
                      >
                        {/* <Col span={1}>
                            <Tooltip title="Hold project upon completion?" zIndex={10000}>
                              <Form.Item
                                {...restField} name={[name, "requirePayment"]} initialValue={false}
                                style={{ marginBottom: 0, marginTop: name === 0 ? 0 : 10 }}
                                valuePropName="checked"
                              >
                                <Checkbox />
                              </Form.Item>
                            </Tooltip>
                          </Col> */}
                        <Col span={3}>
                          <Form.Item
                            {...restField} name={[name, "productId"]} initialValue={undefined}
                            style={{ width: "100%", marginBottom: 0, marginTop: name === 0 ? 0 : 10 }}
                          >
                            <CustomSelect
                              style={{ width: "100%" }}
                              options={productData?.map((item) => ({
                                label: `${item.productCode} - ${item.title}`, value: item.id
                              }))}
                              placeholder="Select Product"
                              onSelect={(value) => {
                                const product = productData?.find((item) => item.id === value);
                                const milestoneData: Milestone[] = form.getFieldValue("milestone");
                                const milestone = milestoneData[name]

                                if (product) {
                                  milestone.amount = product.unitPrice;
                                  milestone.taxRateId = product.taxRateId;
                                  milestone.accountId = product.accountId;
                                  milestone.title = product.description;
                                  milestone.quantity = product.quantity || 1;
                                }
                                form.setFieldsValue({ milestone: milestoneData })
                                onCalculateTotal()
                              }}
                            />
                          </Form.Item>
                        </Col>

                        <Col span={6}>
                          <Form.Item
                            {...restField} name={[name, "title"]} initialValue={""}
                            rules={[{ required: true, message: "Missing item title" }]}
                            style={{ width: "100%", marginBottom: 0, marginTop: name === 0 ? 0 : 10 }}
                          >
                            <TextArea
                              placeholder='Title' className={style.gen_border}
                              autoSize={{ minRows: 1 }}
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
                              // style={{ width: 130 }} 
                              placeholder="Select Tax Rate"
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
                            display: "flex", justifyContent: "center",
                            marginTop: name === 0 ? 10 : 20
                          }}
                        >
                          <Typography color="dark-main" size="sm" weight='semi'>
                            {`${getLineTotal(form.getFieldValue(["milestone", name, "quantity"]), form.getFieldValue(["milestone", name, "amount"]))}`}
                          </Typography>
                        </Col>

                        <Col span={1}>
                          {name !== 0 && (
                            <CustomButton
                              type="danger" size="normal" fontSize="sm"
                              disabled={name === 0 ? true : false}
                              onClick={() => {
                                remove(name)
                                onCalculateTotal();
                              }}
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

              <div>
                <Checkbox
                  checked={checked} className='mb-2'
                  onChange={(e) => {
                    if (e.target.checked === false) {
                      // remove the supervisionMonthlyCharge from the total amount if the checkbox is unchecked
                      form.setFieldsValue({ supervisionMonthlyCharge: 0 })
                      onCalculateTotal();
                    }
                    setChecked(e.target.checked)
                  }}
                >
                  Has Supervision
                </Checkbox>

                {checked && (
                  <Form.Item
                    name="supervisionMonthlyCharge"
                    rules={[{ required: true, message: 'Please input monthly supervision amount!' }]}
                  >
                    <InputNumber
                      placeholder='Enter monthly supervision amount in AED'
                      style={{ width: "100%" }}
                      onChange={onCalculateTotal}
                      addonAfter={(
                        <Form.Item
                          name="supervisionPaymentSchedule" noStyle
                          initialValue={SupervisionPaymentSchedule['End of the Month']}
                        >
                          <Select
                            style={{ width: 170 }} dropdownStyle={{ zIndex: 10000 }}
                            className={style.gen_select}
                            onSelect={(value) => {
                              // use the value to get the key of the SupervisionPaymentSchedule
                              const key = Object.keys(SupervisionPaymentSchedule).find((key) => {
                                return SupervisionPaymentSchedule[key as SupervisionLabelType] === value
                              })

                              if (key) {
                                setSupervisionSchedule(key as SupervisionLabelType)
                              }
                            }}
                          >
                            {PaymentScheduleOptions.map((option) => (
                              <Option
                                value={Number(option.value)}
                                key={`paymentSchedule-${option.value}`}
                              >
                                {option.label}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      )}
                    />
                  </Form.Item>
                )}
              </div>

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

                {checked && (
                  <div className={style.total_item}>
                    <Typography color="dark-main" size="sm">
                      {`Supervision Charge - ${supervisionSchedule}`}
                    </Typography>
                    <Typography color="dark-main" size="sm" className='ml-3'>
                      {formatCurrency(total.supervisionMonthlyCharge)}
                    </Typography>
                  </div>
                )}
              </Card>
              <div>
                <Form.Item
                  name="paymentTerms"
                  rules={[{ required: true, message: 'Please enter payment terms!' }]}
                >
                  <CustomTextArea
                    placeholder='Payment Terms' asterisk
                    label='Payment Terms'
                    autoSize={{ minRows: 3, maxRows: 15 }}
                  />
                </Form.Item>
              </div>

              {/** Quotation Type */}
              <div className='d-flex justify-space-between'>
                <Form.Item
                  name="type" initialValue={quotationType} label="Quotation Type"
                  style={{ marginBottom: 5, marginTop: 20 }}
                >
                  <Radio.Group
                    name="type" buttonStyle="solid"
                    onChange={(e) => setQuotationType(e.target.value)}
                  >
                    {QuotationTypeOptions.map((option) => (
                      <Radio.Button
                        value={Number(option.value)}
                        key={`quotationType-${option.value}`}
                      >
                        {option.label}
                      </Radio.Button>
                    ))}
                  </Radio.Group>
                </Form.Item>

                {(previewData?.leadId || leadId) ?
                  <div className="d-flex align-center mt-5 mb-5"
                    onClick={() => { setFilesDrawer({ open: true, record: { id: previewData?.leadId || leadId } as any }) }}
                  >
                    <p className="cursor-pointer mb-0">
                      Attatchments
                    </p>
                    <Tooltip title="Manage Attachments">
                      <EditOutlined
                        className="ml-2 cursor-pointer"
                      />
                    </Tooltip>
                  </div>
                  : <></>
                }

              </div>


              {quotationType === QuotationTypeEnum.Auto && (
                <Alert
                  message="System will automatically generate quotation based on the above information"
                  type="warning" style={{ marginTop: 15 }}
                />
              )}

              {quotationType === QuotationTypeEnum.Manual && (
                <ImageUploader
                  name="file" label='Drag and drop quotation file'
                  defaultFileList={((type === "edit" && previewData?.file) && [{
                    uid: `${previewData?.id}`,
                    name: previewData?.file,
                    status: "done",
                    url: `${PROTECTED_RESOURCE_BASE_URL}${previewData?.file}?authKey=${access_token}`,
                  }]) || []}
                />
              )}
            </Form>
          ) : (
            <>
              <div style={{ display: 'flex', flexWrap: "nowrap", gap: "10px" }}>
                <Input
                  width={"40%"}
                  placeholder='Enter Quotation Number'
                  value={pullFromXero?.quoteNumber}
                  onChange={(e) => setPullFromXero((prev) => ({
                    ...prev, quoteNumber: e.target.value
                  }))}
                />

                <Select
                  style={{ width: "40%" }}
                  dropdownStyle={{ zIndex: 9999999 }}
                  placeholder="Choose XERO Tenant connection"
                  onChange={(value) => setPullFromXero((prev) => ({
                    ...prev, xeroTenantId: value
                  }))}
                  options={xeroTenants?.map((ele) => {
                    return {
                      label: ele.tenantName,
                      value: ele.tenantId
                    }
                  })} />

                <Button
                  type="primary" style={{ width: 100 }}
                  loading={pullFromXero?.loading}
                  onClick={onPullFromXero}
                >
                  Pull
                </Button>
              </div>
              {pullFromXero?.loading && (
                <Spin
                  tip="Please wait while we are pulling the quotation..."
                  size="large" style={{ height: "80vh" }}
                  className='w-100 d-flex justify-center align-center font-size-lg'
                />
              )}
            </>
          )}
        </>
      ) : (
        <>
          {previewData ? (
            <>
              <Collapse expandIconPosition='end' style={{ margin: "0px 0.5rem 1rem 0.5rem" }}>
                <Panel key={"scopeOfWork"} header={"Details"}>
                  <Typography color='dark-main' className='ml-2 mt-2' weight='bold'>
                    Scope of Work
                  </Typography>
                  <div
                    className={`mx-2 color-dark-sub ${style.accordianItem}`}
                    dangerouslySetInnerHTML={{ __html: previewData?.scopeOfWork }}
                  />
                  <Typography color='dark-main' className='ml-2 mt-2' weight='bold'>
                    Quotation Items
                  </Typography>
                  <div className='color-dark-sub'>
                    <ul className='mb-0'>
                      {previewData?.QuotationMilestone?.map((milestone, index) => (
                        <li key={`milestone-${index}`}>
                          <span className='font-weight-normal'>{milestone?.title}</span>
                          <span className='ml-2'>- {milestone?.amount?.toLocaleString()} AED</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Panel>
              </Collapse>

              <PreviewFile file={previewData?.file} />
            </>
          ) : (
            <Spin
              tip="Please wait while we are preparing the quotation..."
              size="large" style={{ gap: "1rem" }}
              className='w-100 h-100 d-flex justify-center align-center font-size-lg'
            />
          )}
        </>
      )}

      {/** Files Drawer */}
      {filesDrawer.open && (
        <FilesDrawer
          open={filesDrawer.open} record={filesDrawer.record!}
          permissions={permissions as any}
          onClose={() => setFilesDrawer({ open: false, record: null })}
          onRefresh={() => {
            // onUpdate({ perPage: meta?.perPage || 10, page: meta?.page || 1 })
            // // refresh the status counts
            // onRefreshStatusCount();
          }}
        />
      )}
    </Drawer>
  );
};

export default QuotationDrawer;