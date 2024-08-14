import { Form, message, Transfer } from "antd";
import {
	CustomModal,
	CustomErrorAlert,
	CustomButton,
} from "../../../../Atoms";
import styles from "../../../Common/styles.module.scss";
import Skeletons from "../../../Skeletons";
import { useEffect, useCallback, useMemo, useState, useRef } from "react";
import { HandleServerErrors } from "../../../../Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../../helpers";
import { PropTypes } from "../../../Common/common-types";
import { RolesModule } from "../../../../../Modules/Roles";
import { RoleTypes } from "../../../../../Modules/Roles/types";
import { DashboardElementResponseArray, DashboardElementType } from "@modules/DashboardElement/types";
import { DashboardElementModule } from "@modules/DashboardElement";
import { RolePermissionsEnum } from "@modules/Roles/permissions";
import { MenuOutlined } from "@ant-design/icons";
import { DndProvider, useDrop, useDrag } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import styles2 from "./styles.module.scss";

interface RecordType {
	key: string;
	title: string;
	description: string;
	chosen: boolean;
}

interface DashboardElementsModalProps extends PropTypes {
	record: number;
	recordData: RoleTypes
	permissions: { [key in RolePermissionsEnum]: boolean };
}

export const DashboardElementsModal = (props: DashboardElementsModalProps) => {
	const {
		openModal, onCancel, record, reloadTableData,
		recordData, permissions: { createRole }
	} = props;
	const [form] = Form.useForm();

	// roles module
	const module = useMemo(() => new RolesModule(), []);
	const dashboardElementModule = useMemo(() => new DashboardElementModule(), []);
	const [dashboardElementsData, setDashboardElementsData] = useState<Partial<DashboardElementResponseArray>>();

	let selectedKeys: string[] = [];
	if (recordData && recordData.DashboardElements) {
		recordData?.DashboardElements?.map((ele) => {
			selectedKeys.push(ele?.DashboardElement?.id?.toString());
		})
	}

	const [targetKeys, setTargetKeys] = useState<string[]>(selectedKeys);

	const handleErrors = (err: any) => {
		const error = errorHandler(err);
		if (typeof error.message == "string") {
			setDashboardElementsData({ ...dashboardElementsData, error: error.message });
		} else {
			let errData = HandleServerErrors(error.message, []);
			form.setFields(errData);
			setDashboardElementsData({ ...dashboardElementsData, error: "" });
		}
	};

	const handleAlertClose = () => {
		setDashboardElementsData({ ...dashboardElementsData, error: "" });
	};

	const getDashboardElementsData = useCallback(() => {
		dashboardElementModule.getAllRecords().then((res) => {
			if (res.data && res.data?.data) {
				setDashboardElementsData({ ...res.data, loading: false });
			}
		}).catch((err) => {
			handleErrors(err);
		});
	}, [form, record, module, dashboardElementModule]);

	const filterOption = (inputValue: string, option: RecordType) =>
		option?.description?.indexOf(inputValue?.toLowerCase()) > -1;

	const handleChange = (newTargetKeys: string[]) => {
		setTargetKeys(Array.from(new Set(newTargetKeys)));
		form.setFieldValue("elementIds", newTargetKeys)
	};

	useEffect(() => {
		setDashboardElementsData({ loading: true });
		getDashboardElementsData();
	}, [openModal, form]);

	const onFinish = (formValues: { elementIds: number[] }) => {
		console.log(formValues.elementIds)
		if (formValues.elementIds) {
			if (createRole) {
				setDashboardElementsData({ ...dashboardElementsData, buttonLoading: true });
				const formData = formValues?.elementIds?.map((ele) => Number(ele));
				module.addElements({ elementIds: formData }, record).then((res) => {
					reloadTableData();
					onCancel();
					setDashboardElementsData((prev) => ({ ...prev, loading: false }));
					message.success("Saved Successfully");
				}).catch((err) => {
					handleErrors(err);
					setDashboardElementsData((prev) => ({ ...prev, loading: false }));
				});

				let removedRoles: number[] = [];
				selectedKeys.map((ele) => {
					if (!targetKeys.includes(ele)) removedRoles.push(Number(ele));
				})

				if (removedRoles?.length > 0) {
					module.removeElements({ elementIds: removedRoles }, record).catch((err) => {
						message.error(err.message)
					});
				}
			} else {
				message.error("You don't have permission to manage roles, please contact your admin");
			}
		} else {
			message.success("No changes made");
			onCancel();
		}
	};


	//drag and drop logic start
	// change order
	const moveRow = async (dragIndex: number, hoverIndex: number) => {
		const clonedList = targetKeys;
		const el = clonedList.splice(dragIndex, 1)[0];
		clonedList.splice(hoverIndex, 0, el);
		handleChange(clonedList);
	};

	const DraggableItem = ({ index, label, moveRow }: { index: number, label: string, moveRow: (dragIndex: number, hoverIndex: number) => void }) => {
		const type = "DraggableItem";

		const ref: any = useRef();
		const [{ isOver, dropClassName }, drop] = useDrop({
			accept: type,
			collect: (monitor) => {
				const { index: dragIndex } = monitor.getItem() || {};
				if (dragIndex === index) {
					return {};
				}
				return {
					isOver: monitor.isOver(),
					dropClassName:
						dragIndex < index ? ` drop-over-downward` : ` drop-over-upward`
				};
			},
			drop: (item: { index: number; }) => {
				moveRow(item.index, index);
			}
		});

		const [{ isDragging }, drag, preview] = useDrag({
			type,
			item: { index },
			collect: (monitor) => ({
				isDragging: monitor.isDragging()
			})
		});

		preview(drop(ref));

		return (
			<div
				key={label}
				ref={ref}
				className={`${isOver ? dropClassName : ""}` + " " + styles2.itemWrapper}
			>
				<span className="label">{label}</span>
				{index !== -1 && (
					<span ref={drag}>
						<MenuOutlined />
					</span>
				)}
			</div>
		);
	};


	return (
		<CustomModal
			visible={openModal}
			closable={true}
			onCancel={onCancel}
			titleText={"Manage Dashboard Elements"}
			showFooter={false}
		>
			{dashboardElementsData?.loading ? (
				<Skeletons items={10} />
			) : (

				<Form className={styles.form} onFinish={onFinish} form={form}>
					{dashboardElementsData?.error && (
						<CustomErrorAlert
							description={dashboardElementsData?.error}
							isClosable
							onClose={handleAlertClose}
						/>
					)}

					<div>
						<Form.Item name="elementIds" rules={[{ required: false }]}>
							<DndProvider backend={HTML5Backend}>
								<Transfer
									dataSource={dashboardElementsData?.data?.map((ele: DashboardElementType, index: number) => {
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
									//onSearch={handleSearch}
									render={item => (
										<DraggableItem
											index={targetKeys.findIndex((key) => key === item.key)}
											label={item.title}
											moveRow={moveRow}
										/>
									)}
								/>
							</DndProvider>
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
							loading={dashboardElementsData?.buttonLoading}
						>
							Save
						</CustomButton>
					</div>
				</Form>
			)}
		</CustomModal>
	);
};