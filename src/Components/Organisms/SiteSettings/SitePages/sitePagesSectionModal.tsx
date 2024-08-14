import { Form, message, Transfer } from "antd";
import {
	CustomModal,
	CustomErrorAlert,
	CustomButton,
} from "../../../Atoms";
import styles from "../Common/styles.module.scss";
import Skeletons from "../../Skeletons";
import { useEffect, useCallback, useMemo, useState } from "react";
import { HandleServerErrors } from "../../../Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../helpers";
import { PropTypes } from "../../Common/common-types";
import { SitePagesModule } from "../../../../Modules/SitePages";
import { SitePagesType } from "../../../../Modules/SitePages/types";
import { PagesSectionModule } from "../../../../Modules/PagesSection";
import { PagesSectionResponseArray, PagesSectionType } from "../../../../Modules/PagesSection/types";
import { SitePagesPermissionsEnum } from "../../../../Modules/SiteSettings/permissions";
import { PagesSectionPermissionsEnum } from "../../../../Modules/PagesSection/permissions";
import { StaticPageSEOPermissionsEnum } from "../../../../Modules/StaticPageSEO/permissions";

type PermissionsType = {
	[key in SitePagesPermissionsEnum]: boolean
} & {
	[PagesSectionPermissionsEnum.UPDATE]: boolean;
	[PagesSectionPermissionsEnum.READ]: boolean;
	[PagesSectionPermissionsEnum.CREATE]: boolean;
	[StaticPageSEOPermissionsEnum.READ]: boolean;
}

interface RecordType {
	key: string;
	title: string;
	description: string;
	chosen: boolean;
}

interface PagesSectionRelationModalProps extends PropTypes {
	record: number;
	pageData: SitePagesType;
	permissions: PermissionsType
}

export const SitePagesSectionRelationModal = (props: PagesSectionRelationModalProps) => {
	const {
		openModal, onCancel, record, reloadTableData,
		pageData, permissions: { updateSitePagesSection, createSitePagesSection }
	} = props;
	const [form] = Form.useForm();

	const module = useMemo(() => new SitePagesModule(), []);
	const sectionModule = useMemo(() => new PagesSectionModule(), []);
	const [sectionData, setSectionData] = useState<Partial<PagesSectionResponseArray>>();

	let selectedKeys: string[] = [];
	if (pageData && pageData.pageSectionRelation) {
		pageData?.pageSectionRelation?.map((ele) => {
			return selectedKeys.push(ele.pageSectionId.toString());
		})
	}

	const [targetKeys, setTargetKeys] = useState<string[]>(selectedKeys);

	const handleErrors = (err: any) => {
		const error = errorHandler(err);
		if (typeof error.message == "string") {
			setSectionData({ ...sectionData, error: error.message });
		} else {
			let errData = HandleServerErrors(error.message, []);
			form.setFields(errData);
			setSectionData({ ...sectionData, error: "" });
		}
	};

	const handleAlertClose = () => {
		setSectionData({ ...sectionData, error: "" });
	};

	const getSectionData = useCallback(() => {
		sectionModule.getAllRecords().then((res) => {
			if (res.data && res.data.data) {
				// form.setFieldsValue({
				// 	...res.data.data,
				// });
				setSectionData({ ...res.data, loading: false });
			}
		}).catch((err) => {
			handleErrors(err);
		});
	}, [form, record, module, sectionModule]);

	const filterOption = (inputValue: string, option: RecordType) =>
		option.description.indexOf(inputValue.toLowerCase()) > -1;

	const handleChange = (newTargetKeys: string[]) => {
		setTargetKeys(newTargetKeys);
	};

	useEffect(() => {
		setSectionData({ loading: true });
		getSectionData();
	}, [openModal, form]);

	const onFinish = (formValues: any) => {
		if (updateSitePagesSection === true) {
			setSectionData({ ...sectionData, buttonLoading: true });
			const formData = formValues;
			module.updateRecord(formData, record).then((res) => {
				reloadTableData();
				onCancel();
				setSectionData((prev) => ({ ...prev, loading: false }));
			}).catch((err) => {
				handleErrors(err);
				setSectionData((prev) => ({ ...prev, loading: false }));
			});

			let removedSections: string[] = [];
			selectedKeys.map((ele) => {
				if (!targetKeys.includes(ele)) {
					return removedSections.push(ele);
				}
				return []
			})

			if (removedSections.length > 0) {
				module.deleteMultiple(record, removedSections).catch((err) => {
					message.error(err.message)
				});
			}
		} else {
			message.error("You don't have permission to manage pages section, please contact admin.");
		}
	};

	return (
		<CustomModal
			visible={openModal}
			closable={true}
			onCancel={onCancel}
			titleText={"Manage Section"}
			showFooter={false}
		>
			{sectionData?.loading ? (
				<Skeletons items={10} />
			) : (

				<Form className={styles.form} onFinish={onFinish} form={form}>
					{sectionData?.error && (
						<CustomErrorAlert
							description={sectionData?.error}
							isClosable
							onClose={handleAlertClose}
						/>
					)}

					{createSitePagesSection === true && (
						<div className="mb-2">
							<a href="/siteSettings/pages-section">Section not found? Click to add</a>
						</div>
					)}
					<div>
						<Form.Item name="pageSectionIds" rules={[{ required: false }]}>
							<Transfer
								dataSource={sectionData?.data?.map((ele: PagesSectionType, index: number) => {
									return {
										key: ele.id.toString(),
										title: ele.title,
										description: ele.title?.toLowerCase(),
									}
								})}
								listStyle={{
									width: 250,
									height: 400,
								}}
								showSearch
								filterOption={filterOption}
								targetKeys={targetKeys}
								onChange={handleChange}
								render={item => item.title}

							/>
						</Form.Item>
					</div>


					<div className={styles.footer}>
						<CustomButton size="normal" fontSize="sm" onClick={onCancel} type="plain">
							Cancel
						</CustomButton>
						<CustomButton
							type="primary"
							size="normal"
							fontSize="sm"
							htmlType="submit"
							loading={sectionData?.buttonLoading}
						>
							Save
						</CustomButton>
					</div>
				</Form>
			)}
		</CustomModal>
	);
};
