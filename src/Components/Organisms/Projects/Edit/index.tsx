import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Form, message } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "Redux/store";
import Layout from "@templates/Layout";
import {
  EditBasicInfoFormTypes, EditDeadlineInfoFormTypes, ProjectFormSteps
} from "./types";
import { BasicInfoTab, DeadlineInfoTab } from "./Tabs";
import EditProjectMenu from "./EditProjectMenu";
import { OrganizationModule } from "@modules/Organization";
import { OrganizationType } from "@modules/Organization/types";
import { ProjectTypeModule } from "@modules/ProjectType";
import { ProjectTypeType } from "@modules/ProjectType/types";
import { DepartmentModule } from "@modules/Department";
import { DepartmentType } from "@modules/Department/types";
import { UserModule } from "@modules/User";
import { UserTypes } from "@modules/User/types";
import { ProjectModule } from "@modules/Project";
import { ProjectTypes } from "@modules/Project/types";
import { ProjectPermissionsEnum } from "@modules/Project/permissions";
import { useConditionFetchData, useFetchData } from "hooks";
import { useDebounce } from "@helpers/useDebounce";
import { ProjectRoleEnum } from "@helpers/commonEnums";
import styles from "./styles.module.scss";
import { ClientType } from "@modules/Client/types";
import { ClientModule } from "@modules/Client";
import { getPermissionSlugs } from "@helpers/common";

type TabKeysType = keyof typeof ProjectFormSteps;
// string array of completed tabs using the ProjectFormSteps enum keys as values
type CompletedTabsTypes = Array<TabKeysType>;
// object with keys of ProjectFormSteps enum keys and values of the corresponding form data type
type CompletedFormDataType = {
  basic_info: EditBasicInfoFormTypes
  deadline_info: EditDeadlineInfoFormTypes
};

// Types for the search params
type ClientRepresenativeSearchTypes = {
  name?: string;
  ids?: number[];
}

// Types for the search params
type ProjectInchargeSearchTypes = {
  name?: string;
  ids?: number[];
}

// Types for the search params
type SupportEngineersSearchTypes = {
  name?: string;
  ids?: number[];
}

const EditProject: FC = () => {
  const navigate = useNavigate();
  // available permissions for the projects page
  const permissionSlug = getPermissionSlugs(ProjectPermissionsEnum)
  const { userPermissions } = useSelector((state: RootState) => state.usersReducer);
  const { updateProject } = userPermissions as { [key in ProjectPermissionsEnum]: boolean };

  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("id") || "";
  // form instances for each tab
  const [basicInfoForm] = Form.useForm<EditBasicInfoFormTypes>();
  const [deadlineInfoForm] = Form.useForm<EditDeadlineInfoFormTypes>();

  const [currentTab, setCurrentTab] = useState<TabKeysType>("basic_info");
  const [completedTabs, setCompletedTabs] = useState<CompletedTabsTypes>([]);
  const [completeFormData, setCompleteFormData] = useState<CompletedFormDataType>();

  // Client Search Term
  const [clientTerm, setSearchClient] = useState("");
  const debouncedClientTerm = useDebounce(clientTerm, 500);
  // Client Represenative Search Term
  const [clientRepTerm, setSearchClientRep] = useState("");
  const debouncedClientRepTerm = useDebounce(clientRepTerm, 500);
  // Project Incharge Search Term
  const [projectInchargeTerm, setSearchProjectIncharge] = useState("");
  const debouncedProjectInchargeTerm = useDebounce(projectInchargeTerm, 500);
  // Support Engineers Search Term
  const [supportEngineersTerm, setSearchSupportEngineers] = useState("");
  const debouncedSupportEngineersTerm = useDebounce(supportEngineersTerm, 500);

  // Clients Search
  const [clients, setClients] = useState<ClientType[]>([]);
  // Client Representative Searched Users
  const [representative, setRepresentative] = useState<ClientType[]>([]);
  // Project Incharge Searched Users
  const [projectIncharge, setProjectIncharge] = useState<UserTypes[]>([]);
  // Support Engineers Searched Users
  const [supportEngineers, setSupportEngineers] = useState<UserTypes[]>([]);
  // Project File Links
  const [projectFileLinks, setProjectFileLinks] = useState<{ name?: string, link: string }[]>([])

  // Modules
  const projectModule = useMemo(() => new ProjectModule(), []);
  const clientModule = useMemo(() => new ClientModule(), []);
  const orgModule = useMemo(() => new OrganizationModule(), []);
  const userModule = useMemo(() => new UserModule(), []);
  const projectTypeModule = useMemo(() => new ProjectTypeModule(), []);
  const departmentModule = useMemo(() => new DepartmentModule(), []);

  // Fetch Project Data From API
  const { data, loading } = useConditionFetchData<ProjectTypes>({
    method: () => projectModule.getRecordById(Number(projectId)),
    condition: !!projectId,
  })

  // Fetch Project Type Data From API
  const { data: projectTypeData } = useFetchData<ProjectTypeType[]>({
    method: projectTypeModule.getPublishRecords,
  })

  const { data: departmentData } = useFetchData<DepartmentType[]>({
    method: departmentModule.getAllPublishedRecords,
  })

  const { data: organizationData } = useFetchData<OrganizationType[]>({
    method: orgModule.findPublished,
  })

  const { data: initialClient } = useConditionFetchData<ClientType[]>({
    method: clientModule.findPublished,
    condition: !!data?.clientId,
    initialQuery: { ids: [data?.clientId] }
  })

  /** Get Client Representative From API
   * @param {string} params.name - Search Term
   * @param {number} params.organizationId - Organization Id
   * @param {number[]} params.ids - User Ids
   */
  const GetClientRepresentative = (params: ClientRepresenativeSearchTypes) => {
    clientModule.findPublished(params).then((res) => {
      setRepresentative((prev) => {
        // if the data is already present in the state, then don't add it again
        const filteredData = res?.data?.data?.filter((item) => {
          return !prev?.find((prevItem) => prevItem.id === item.id);
        });
        // add the new data to the existing data
        return [...prev, ...filteredData];
      })
    }).catch((err) => {
      message.error(err.response.data.message)
    })
  }

  /**
   * Get Project Incharge From API
   * @param {string} params.name - Search Term
   * @param {number[]} params.ids - User Ids
   */
  const GetProjectIncharge = (params: ProjectInchargeSearchTypes) => {
    userModule.getAllRecords(params).then((res) => {
      setProjectIncharge((prev) => {
        // if the data is already present in the state, then don't add it again
        const filteredData = res?.data?.data?.filter((item) => {
          return !prev?.find((prevItem) => prevItem.id === item.id);
        });
        // add the new data to the existing data
        return [...prev, ...filteredData];
      })
    }).catch((err) => {
      message.error(err.response.data.message)
    })
  }

  /**
   * Get Support Engineers From API
   * @param {string} params.name - Search Term
   * @param {number[]} params.ids - User Ids
   * */
  const GetSupportEngineers = (params: SupportEngineersSearchTypes) => {
    userModule.getAllRecords(params).then((res) => {
      setSupportEngineers((prev) => {
        // if the data is already present in the state, then don't add it again
        const filteredData = res?.data?.data?.filter((item: UserTypes) => {
          return !prev?.find((prevItem) => prevItem.id === item.id);
        });
        // add the new data to the existing data
        return [...prev, ...filteredData];
      })
    }).catch((err) => {
      message.error(err.response.data.message)
    })
  }

  // Prepare Form Data From API
  const setFormData = useCallback(() => {
    if (data && !loading) {
      // Prepare Basic Info Form Data
      const { ProjectMembers, ProjectClient } = data

      // Get Client Representative Id
      const clientRepId = ProjectClient?.find((client) => {
        return client.isRepresentative === true
      })?.clientId

      // Get Project Incharge Id
      const projectInchargeId = ProjectMembers?.find((member) => {
        return member.projectRole === ProjectRoleEnum['projectIncharge']
      })?.User.id

      // Get Support Engineers Id
      const supportEngineersId = ProjectMembers?.filter((member) => {
        return member.projectRole === ProjectRoleEnum['supportEngineers']
      })?.map((member) => member.User.id)

      // Get Client Representative
      if (clientRepId) {
        GetClientRepresentative({ ids: [clientRepId] })
      }

      // Get Project Incharge
      if (projectInchargeId) {
        GetProjectIncharge({ ids: [projectInchargeId] })
      }

      // Get Support Engineers
      if (supportEngineersId?.length) {
        GetSupportEngineers({ ids: supportEngineersId })
      }

      const basic_info: EditBasicInfoFormTypes = {
        title: data.title,
        projectTypeId: data.projectTypeId,
        referenceNumber: data.referenceNumber,
        clientId: data.clientId,
        submissionById: data.submissionById,
        clientRepresentativeId: clientRepId!,
        xeroReference: data.xeroReference,
      }

      try {
        // Set Project File Links
        const _projectFileLinks = JSON.parse(data.projectFilesLink);
        if (typeof _projectFileLinks === "string") {
          setProjectFileLinks([{ link: _projectFileLinks }])
        } else {
          setProjectFileLinks((_projectFileLinks) ? _projectFileLinks : [])
        }
      } catch (err: any) {
        console.error("Error while parsing project file links", err?.message)
      }

      // Prepare Deadline Info Form Data
      const deadline_info: EditDeadlineInfoFormTypes = {
        instructions: data.instructions,
        priority: String(data.priority),
        projectInchargeId: projectInchargeId!,
        supportEngineersId: supportEngineersId,
        startDate: data.startDate,
        endDate: data.endDate,
        /** NOTE: leave projectFilesLink as empty string because the actual 
         * value is in the projectFilesLink state which is an array of strings
         */
        projectFilesLink: "",
        projectFilesLinkName: "",
      }

      // Set Form Data
      basicInfoForm.setFieldsValue(basic_info);
      deadlineInfoForm.setFieldsValue(deadline_info);

      // Set Completed Tabs
      const _completedTabs: CompletedTabsTypes = [
        ProjectFormSteps.basic_info,
        ProjectFormSteps.deadline_info
      ];
      setCompletedTabs(_completedTabs);
    }
  }, [data]);

  useEffect(() => {
    setFormData();
  }, [setFormData]);

  /**
   * @description this function is used to set the tab when the user clicks on the tab menu item (the menu item is disabled if the tab is not completed)
   * @param tab - the tab key
   * */
  const onTabClick = useCallback((tab: TabKeysType) => {
    if (completedTabs.includes(tab)) {
      setCurrentTab(tab);
    }
  }, [completedTabs]);

  /**
   * @description this function is used to go to the next or previous tab
   * @param action - the action to perform, either `next` or `prev`
   * @param step - the current tab key
   */
  const onGoToStep = useCallback((action: "next" | "prev", step?: TabKeysType) => {
    // get the keys of the ProjectFormSteps enum
    const tabKeys = Object.keys(ProjectFormSteps);
    switch (action) {
      case "next": {
        // get the index of the next tab by finding the index of the current tab and adding 1 to it
        const nextTabIndex = tabKeys.findIndex((item) => item === step) + 1;
        // if the next tab index is not the last one (the last one is the length of the tab keys array)
        if (nextTabIndex !== tabKeys.length) {
          // get the next tab key
          const nextTab = tabKeys.filter((_item, index) => index === nextTabIndex);
          // set the current tab to the next tab
          setCurrentTab(nextTab[0] as TabKeysType);
        }
        break;
      }
      case "prev": {
        // get the index of the current tab
        const currentTabIndex = tabKeys.findIndex((item) => item === currentTab);
        // if the current tab index is not the first one (the first one is 0)
        if (currentTabIndex !== 0) {
          // get the previous tab key
          const previousTab = tabKeys.filter((_item, index) => index === currentTabIndex - 1);
          // set the current tab to the previous tab
          setCurrentTab(previousTab[0] as TabKeysType);
        }
        break;
      }
    }
  }, [currentTab]);

  /** This function is called when the user clicks on the back button of the current tab */
  const onBackClick = () => onGoToStep("prev");

  /**
   * @param step the current tab key
   * @param data the form data of the current tab
   * @description this function is called when the user tries to submit the form of the current tab
   */
  const onFinish = useCallback((step: TabKeysType, data: CompletedFormDataType[TabKeysType]) => {
    const completeData = { ...completeFormData, [step]: data } as CompletedFormDataType;
    setCompleteFormData(completeData);
    setCompletedTabs((prev) => {
      if (!prev.includes(step)) {
        return [...prev, step];
      }
      return prev;
    });

    if (step === ProjectFormSteps.deadline_info) {
      const { deadline_info, basic_info } = completeData
      const projectData = {
        // Basic Info Form Data
        title: basic_info?.title,
        clientId: basic_info?.clientId,
        clientRepresentativeId: basic_info?.clientRepresentativeId,
        projectTypeId: basic_info?.projectTypeId,
        submissionById: basic_info?.submissionById,
        referenceNumber: basic_info?.referenceNumber,
        xeroReference: basic_info?.xeroReference,
        // Deadline Info Form Data
        startDate: deadline_info?.startDate,
        endDate: deadline_info?.endDate,
        priority: Number(deadline_info?.priority),
        projectInchargeId: deadline_info?.projectInchargeId,
        supportEngineersId: deadline_info?.supportEngineersId,
        instructions: deadline_info?.instructions,
        projectFilesLink: deadline_info?.projectFilesLink,
      }

      if (updateProject === true) {
        projectModule.updateRecord(projectData, Number(projectId)).then((res) => {
          message.success(res?.data?.message || "Project Updated Successfully!")
          window.location.href = "/projects?all=true"
        }).catch((err) => {
          const errorMessages = err.response.data.message || "Something went wrong!"
          message.error(errorMessages)
        })
      } else {
        message.error("You are not authorized to update this project!, Please contact your admin.")
      }
    } else {
      onGoToStep("next", step);
    }
  }, [completeFormData, onGoToStep]);

  // Client Search
  const onClientSearch = useCallback(() => {
    if (debouncedClientTerm) {
      clientModule.findPublished({ name: debouncedClientTerm }).then((res) => {

        const { data } = res;

        setClients((prev) => {
          // if the data is already present in the state, then don't add it again
          const filteredData = data?.data?.filter((item) => {
            return !prev?.find((prevItem) => prevItem.id === item.id);
          });
          // add the new data to the existing data
          return [...prev, ...filteredData];
        })
      }).catch((err) => {
        message.error(err.response.data.message)
      })
    }
  }, [debouncedClientTerm])

  useEffect(() => {
    onClientSearch()
  }, [onClientSearch])

  // Client Represenative Search
  const onClientRepSearch = useCallback(() => {
    if (debouncedClientRepTerm) {
      const params = {
        name: debouncedClientRepTerm,
        organizationId: basicInfoForm.getFieldValue("clientId"),
      }

      GetClientRepresentative(params)
    }
  }, [debouncedClientRepTerm])

  useEffect(() => {
    onClientRepSearch()
  }, [onClientRepSearch])

  // set the default value for the client field
  useEffect(() => {
    if (initialClient) {
      setClients((prev) => {
        // if the data is already present in the state, then don't add it again
        const filteredData = initialClient?.filter((item) => {
          return !prev?.find((prevItem) => prevItem.id === item.id);
        });
        // add the new data to the existing data
        return [...prev, ...filteredData];
      })
    }
  }, [initialClient])

  // Project InCharge Search
  const onProjectInChargeSearch = useCallback(() => {
    if (debouncedProjectInchargeTerm) {
      const params = {
        name: debouncedProjectInchargeTerm
      }

      GetProjectIncharge(params)
    }
  }, [debouncedProjectInchargeTerm])

  useEffect(() => {
    onProjectInChargeSearch()
  }, [onProjectInChargeSearch])

  // Support Engineer Search
  const onSupportEngineerSearch = useCallback(() => {
    if (debouncedSupportEngineersTerm) {
      const params = {
        name: debouncedSupportEngineersTerm
      }

      GetSupportEngineers(params)
    }
  }, [debouncedSupportEngineersTerm])

  useEffect(() => {
    onSupportEngineerSearch()
  }, [onSupportEngineerSearch])

  // If there is no project id in the url, then redirect the user to the projects page
  useEffect(() => {
    if (!projectId) {
      navigate('/projects?all=true')
    }
  }, [projectId])

  const MenuItems = {
    basic_info: (
      <BasicInfoTab
        form={basicInfoForm}
        onFinish={onFinish}
        options={{
          organization: organizationData!,
          department: departmentData!,
          projectType: projectTypeData!,
          searchedClients: clients,
          searchedClientsRep: representative,
        }}
        searchTerms={{
          setSearchClient: setSearchClient,
          setSearchClientRep: setSearchClientRep,
        }}
        loading={loading}
      />
    ),
    // project_info: (
    //   <ProjectInfoTab
    //     form={projectInfoForm}
    //     onBackClick={onBackClick}
    //     onFinish={onFinish}
    //     options={{
    //       projectComponent: projectComponentData!,
    //       authorities: authoritiesData!,
    //     }}
    //     states={{
    //       projectFileLinks: projectFileLinks,
    //       setProjectFileLinks: setProjectFileLinks,
    //     }}
    //   />
    // ),
    deadline_info: (
      <DeadlineInfoTab
        form={deadlineInfoForm}
        onBackClick={onBackClick}
        onFinish={onFinish}
        options={{
          searchedProjectIncharge: projectIncharge,
          searchedSupportEngineers: supportEngineers,
        }}
        searchTerms={{
          setSearchProjectIncharge: setSearchProjectIncharge,
          setSearchSupportEngineers: setSearchSupportEngineers,
        }}
        states={{
          projectFileLinks: projectFileLinks,
          setProjectFileLinks: setProjectFileLinks,
        }}
      />
    ),
  };

  return (
    <Layout
      showAddProject={false} className="pa-0"
      permissionSlug={permissionSlug}
    >
      <div className={styles.container}>
        <EditProjectMenu
          currentTab={currentTab}
          onTabClick={onTabClick}
          completedTabs={completedTabs}
        />
        <div className={styles.wrap}>
          {MenuItems[currentTab]}
        </div>
      </div>
    </Layout>
  )
}

export default EditProject;