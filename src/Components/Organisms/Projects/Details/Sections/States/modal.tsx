import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Form, message, Transfer, Skeleton, Table } from "antd";
import {
  CustomModal,
  CustomErrorAlert,
  CustomButton,
} from "../../../../../Atoms";
import styles from "../../../../Common/styles.module.scss";
import { HandleServerErrors } from "../../../../../Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../../../helpers";
import { PropTypes } from "../../../../Common/common-types";
import { ProjectModule } from "../../../../../../Modules/Project";
import { ProjectStateModule } from "../../../../../../Modules/ProjectState";
import { ProjectEnableStatesModule } from "../../../../../../Modules/ProjectEnableStates";
import { ProjectStateType } from "../../../../../../Modules/ProjectState/types";
import { ProjectEnableStatesType } from "../../../../../../Modules/ProjectEnableStates/types";
import { UserPermissionsEnum } from "../../../../../../Modules/User/permissions";
import { ProjectPermissionsEnum } from '../../../../../../Modules/Project/permissions';

import { ProjectTypes } from '../../../../../../Modules/Project/types';
import { GetResponseTypes } from "@modules/Common/common.interface";

interface RecordType {
  key: string;
  title: string;
  description: string;
  chosen: boolean;
}

interface ProjectStateModalProps extends PropTypes {
  openModal: boolean;
  onCancel: () => void;
  projectId: number;
  reloadTableData: () => void;
  permissions: { [key in ProjectPermissionsEnum]: boolean };
  currentForm: string;
}

export const ProjectStateModal = (props: ProjectStateModalProps) => {
  const {
    openModal,
    onCancel,
    projectId,
    reloadTableData,
    permissions,
  } = props;
  const [form] = Form.useForm();

  console.log("Project ID:", projectId);
  const projectModule = useMemo(() => new ProjectModule(), []);
  const projectStateModule = useMemo(() => new ProjectStateModule(), []);
  const projectEnableStatesModule = useMemo(() => new ProjectEnableStatesModule(), []);
  const [projectStatesData, setProjectStatesData] = useState<Partial<ProjectStateType[]>>([]);
  const [projectEnableStates, setProjectEnableStates] = useState<Partial<ProjectEnableStatesType[]>>([]);
  const [projectsMap, setProjectsMap] = useState<Map<number, string>>(new Map());
  const [projectStatesMap, setProjectStatesMap] = useState<Map<number, string>>(new Map());

  const [loading, setLoading] = useState(true);

  let selectedKeys: string[] = [];
  projectEnableStates?.forEach((ele) => {
    if (ele?.pstateId) selectedKeys.push(ele.pstateId.toString());
  });
  console.log("States selected", projectEnableStates)

  const [targetKeys, setTargetKeys] = useState<string[]>(selectedKeys);

  const handleErrors = (err: any) => {
    const error = errorHandler(err);
    if (typeof error.message == "string") {
      message.error(error.message);
    } else {
      let errData = HandleServerErrors(error.message, []);
      form.setFields(errData);
    }
  };

  const getProjectStatesData = useCallback(() => {
    setLoading(true);
	
    projectStateModule.getAllStates().then((res) => {
      if (res.data) {
        // Sort the data alphabetically by title (or another property)
		const sortedData = res.data.data.sort((a: ProjectStateType, b: ProjectStateType) => {
			return a.title.localeCompare(b.title);
		});
		setProjectStatesData(sortedData);
		console.log(sortedData);
		 // Create a map for project state IDs and titles
		 const projectStatesMap = new Map<number, string>();
		 sortedData.forEach(state => {
		   projectStatesMap.set(state.id, state.title);
		 });
		 setProjectStatesMap(projectStatesMap);
 
		 // Log the projectStatesMap to debug
		 console.log("Project States Map:", projectStatesMap);
      }
	  
      setLoading(false);
    }).catch((err) => {
      handleErrors(err);
      setLoading(false);
    });
  }, [projectStateModule]);

  const getProjectEnableStatesData = useCallback(() => {
    setLoading(true);
    console.log("Fetching project enable states for project ID:", projectId);

    projectModule.getByProjectId<GetResponseTypes<ProjectTypes>>(projectId).then((res) => {
        console.log("Response received:", res);
        console.log("Response data:", res.data);

        if (res.data && res.data.data && res.data.data.ProjectEnableStates) {
            //console.log("Project Enable States:", res.data.data.ProjectEnableStates);
            setProjectEnableStates(res.data.data.ProjectEnableStates);

			// Fetch project titles and create a map
			const projectsMap = new Map<number, string>();
			projectsMap.set(res.data.data.id, res.data.data.title); // Assuming the project title is in the main project data
			setProjectsMap(projectsMap);

			// Create selected keys for the transfer component
			const selectedKeys = res.data.data.ProjectEnableStates.map((ele) => ele.pstateId.toString());
			setTargetKeys(selectedKeys);

			// Log the projectsMap and selectedKeys to debug
			console.log("Projects Map:", projectsMap);
			console.log("Selected Keys:", selectedKeys);
			
        } else {
            console.log("No project enable states found or unexpected response structure.");
        }

        setLoading(false);
    }).catch((err) => {
        console.error("Error fetching project enable states:", err);
        handleErrors(err);
        setLoading(false);
    });
}, [projectId]);

  const handleChange = (nextTargetKeys: string[]) => {
    setTargetKeys(nextTargetKeys);
  };

  const filterOption = (inputValue: string, option: { title: string }) => option.title.indexOf(inputValue) > -1;

  useEffect(() => {
    if (openModal) {
      getProjectStatesData();
      getProjectEnableStatesData();
    }
  }, [openModal, getProjectStatesData, getProjectEnableStatesData]);

  const onFinish = (formValues: { projectStateIds: number[] }) => {
    const formData = formValues?.projectStateIds?.map((ele) => Number(ele));
    console.log('Form Data:', formData);
    projectModule.createEnableStates({ projectStateIds: formData }, projectId).then((res) => {
      reloadTableData();
      onCancel();
      message.success("Saved Successfully!!");
    }).catch((err) => {
      handleErrors(err);
    });

    let removedStates: number[] = [];
    selectedKeys.forEach((ele) => {
      if (!targetKeys.includes(ele)) removedStates.push(Number(ele));
    });

    if (removedStates.length > 0) {
      projectModule.removeProjectStates({ projectStateIds: removedStates }, projectId).catch((err) => {
        message.error(err.message);
      });
    }
  };
  
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Project Title',
      dataIndex: 'pId',
      key: 'pId',
      render: (pId: number) => projectsMap.get(pId) || pId,
    },
    {
      title: 'Project State Title',
      dataIndex: 'pstateId',
      key: 'pstateId',
      render: (pstateId: number) => projectStatesMap.get(pstateId) || pstateId,
    },
    {
      title: 'Is Published',
      dataIndex: 'isPublished',
      key: 'isPublished',
      render: (text: boolean) => (text ? 'Yes' : 'No'),
    },
    {
      title: 'Is Deleted',
      dataIndex: 'isDeleted',
      key: 'isDeleted',
      render: (text: boolean) => (text ? 'Yes' : 'No'),
    },
  ];

  return (
    <CustomModal
      visible={openModal}
      closable={true}
      onCancel={onCancel}
      titleText={"Manage Project States"}
      showFooter={false}
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 20 }} /> // Adjust the number of rows if needed
      ) : (
		<>
		{/* <Table
            dataSource={projectEnableStates.filter(Boolean) as ProjectEnableStatesType[]}
            columns={columns}
            rowKey="id"
            pagination={false}
          /> */}
        <Form className={styles.form} onFinish={onFinish} form={form}>
          <div>
            <Form.Item name="projectStateIds" rules={[{ required: false }]}>
              <Transfer
                dataSource={projectStatesData.filter(Boolean).map((ele) => ({
                  key: ele!.id.toString(),
                  title: ele!.title,
                  description: ele!.title.toLowerCase(),
                  chosen: targetKeys.includes(ele!.id.toString()),
                }))}
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
            >
              Save
            </CustomButton>
          </div>
        </Form>
		</>
      )}
    </CustomModal>
  );
};
