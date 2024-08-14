
import { Form, message, Popconfirm, Select, Empty, Table } from "antd";
import {
    CustomInput,
    CustomErrorAlert,
    CustomButton,
} from "../../../../Atoms";
import styles from "../../../Common/styles.module.scss";
import { useEffect, useCallback, useMemo, useState } from "react";
import { HandleServerErrors } from "../../../../Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../../helpers";
import { UserModule } from "../../../../../Modules/User";
import { UserResponseObject } from "../../../../../Modules/User/types";
import { PropTypes } from "../../../Common/common-types";
import Skeletons from "@organisms/Skeletons";
import { DeleteOutlined } from "@ant-design/icons";
import { CompanyAssetModule } from "@modules/CompanyAsset";
import { CompanyAssetType } from "@modules/CompanyAsset/types";
import { useDebounce } from "@helpers/useDebounce";
import { CompanyAssetTypeEnum } from "@helpers/commonEnums";
import { capitalize } from "@helpers/common";

export const Resources = ({
    type,
    record,
    openModal,
    onCancel,
    updateUser,
    manageAllUser,
    reloadTableData }: {
        record: number,
        updateUser: boolean,
        manageAllUser: boolean,
    } & PropTypes) => {
    const [form] = Form.useForm();
    const module = useMemo(() => new UserModule(), []);
    const [recordData, setRecordData] = useState<Partial<UserResponseObject>>();
    const [assetType, setAssetType] = useState();

    const assetModule = new CompanyAssetModule();
    const [searchTermAssets, setSearchTermAssets] = useState("");
    const debouncedSearchTermAssets = useDebounce(searchTermAssets, 500);
    const [companyAssets, setCompanyAssets] = useState<CompanyAssetType[]>([]);
    const onAssetsSearch = useCallback(() => {
        if (debouncedSearchTermAssets || assetType) {
            assetModule.getAllRecords({ type: assetType }).then((res) => {
                setCompanyAssets(res.data.data)
            }).catch((err) => {
                message.error(err.response.data.message)
            })
        }
    }, [assetModule, debouncedSearchTermAssets])
    useEffect(() => {
        onAssetsSearch()
    }, [debouncedSearchTermAssets, assetType])


    const handleErrors = (err: any) => {
        const error = errorHandler(err);
        if (typeof error.message == "string") {
            setRecordData({ ...recordData, error: error.message });
        } else {
            let errData = HandleServerErrors(error.message, []);
            form.setFields(errData);
            setRecordData({ ...recordData, error: "" });
        }
    };

    const handleAlertClose = () => {
        setRecordData({ ...recordData, error: "" });
    };

    // Get data for the selected record from the api and set it in the form
    const getDataBySlug = useCallback(() => {
        module.getRecordById(record).then((res) => {
            if (res.data && res.data.data) {
                setRecordData({ ...res.data, loading: false });
            }

        }).catch((err) => {
            handleErrors(err);
        });

    }, [form, record, module]);


    useEffect(() => {
        if (type === "edit") {
            setRecordData({ loading: true });
            getDataBySlug();
        } else {
            // fetch the countries
            form.resetFields();
        }
    }, [openModal, type, form, getDataBySlug]);

    const onFinish = (formValues: any) => {
        setRecordData({ ...recordData, buttonLoading: true });
        if (updateUser === true) {
            assetModule.allocateResources({ ...formValues, userId: record.toString() })
                .then((res) => {
                    // reloadTableData();
                    getDataBySlug();
                    form.resetFields();
                    setRecordData((prev) => ({ ...prev, buttonLoading: false }));
                }).catch((err) => {
                    handleErrors(err);
                    setRecordData((prev) => ({ ...prev, buttonLoading: false }));
                });
        } else {
            setRecordData((prev) => ({ ...prev, buttonLoading: false }));
            message.error("You don't have permission to update this user");
        }
    };

    const columns = [
        {
            title: 'Resource',
            dataIndex: 'assetName',
            key: 'assetName',
            render: (text: any, record: any) => <div>{record?.CompanyAsset?.assetName}</div>
        },
        {
            title: 'Label',
            dataIndex: 'label',
            key: 'label'
        },
        {
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
            render: (text: any, record: any) => <div>{record?.CompanyAsset?.code}</div>
        },
        manageAllUser ? {
            title: 'Action',
            key: 'action',
            render: (text: any, record: any) => <Popconfirm
                placement="top"
                title="Are you sure?"
                onConfirm={() => assetModule.revokeResources(record?.id)
                    .then(() => {
                        getDataBySlug();
                    })}
                okText="Yes"
                cancelText="No"
            >
                <DeleteOutlined className={styles.bg__red} />
            </Popconfirm>
        } : {}
    ];

    return (
        <>
            {recordData?.loading ? (
                <Skeletons items={10} />) : (
                manageAllUser && <Form className={styles.form} onFinish={onFinish} form={form}>
                    {recordData?.error && (
                        <CustomErrorAlert
                            description={recordData?.error}
                            isClosable
                            onClose={handleAlertClose}
                        />
                    )}

                    <div>
                        <div>
                            <label className={"font-size-sm"}>
                                Type  <span className='color-red-yp'>*</span>
                            </label>
                            <Select
                                allowClear
                                style={{ width: "100%", height: 'unset' }}
                                defaultValue={recordData?.data?.type}
                                placeholder="Search for the asset type"
                                className="selectAntdCustom"
                                onChange={(value) => setAssetType(value)}
                                showSearch
                                onSearch={(value) => { }}
                                optionFilterProp="label"
                                options={Object.entries(CompanyAssetTypeEnum)?.map(([key, value]) => {
                                    return {
                                        label: capitalize(key.replace("_", " ")),
                                        value: Number(value),
                                    }
                                })}
                                notFoundContent={
                                    <Empty
                                        image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                                        imageStyle={{
                                            height: 100,
                                        }}
                                        description={
                                            <span>
                                                No data found, Please search for the type
                                            </span>
                                        }
                                    />
                                }
                            />
                        </div>
                        <Form.Item
                            name="companyAssetId"
                            rules={[
                                { required: true, message: "Please select a resource" },
                            ]}
                        >
                            <label className={"font-size-sm color-dark-main"}>
                                Company Resource  <span className='color-red-yp'>*</span>
                            </label>

                            <Select
                                allowClear
                                style={{ width: "100%" }}
                                defaultValue={recordData?.data?.companyAssetId}
                                placeholder="Search for the resource"
                                className="selectAntdCustom"
                                onChange={(value) => form.setFieldsValue({ companyAssetId: value })}
                                showSearch
                                onSearch={(value) => setSearchTermAssets(value)}
                                optionFilterProp="label"
                                options={companyAssets?.map((item) => {
                                    return {
                                        label: item.assetName,
                                        value: item.id,
                                    }
                                })}
                                notFoundContent={
                                    <Empty
                                        image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                                        imageStyle={{
                                            height: 100,
                                        }}
                                        description={
                                            <span>
                                                No data found, Please search for the resource
                                            </span>
                                        }
                                    />
                                }
                            />
                        </Form.Item>
                        <Form.Item
                            name="label"
                            rules={[{ required: true, message: "Please add label.", }]}
                        >
                            <CustomInput size="w100" label={"Label"} asterisk type="text" />
                        </Form.Item>
                        <Form.Item
                            name="quantity"
                            rules={[{ required: true, message: "Please add quantity.", }]}
                        >
                            <CustomInput size="w100" label={"Quantity"} asterisk type="number" />
                        </Form.Item>
                        <div style={{ alignSelf: 'center' }}>

                            <CustomButton
                                type="primary"
                                size="normal"
                                fontSize="sm"
                                htmlType="submit"
                                loading={recordData?.buttonLoading}
                            >
                                Submit
                            </CustomButton>
                        </div>
                    </div>
                </Form>
            )}

            {recordData?.data?.AssetAllocation.length > 0 && <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Table columns={columns} dataSource={recordData?.data?.AssetAllocation} pagination={false} />
            </div>}

        </>)

}