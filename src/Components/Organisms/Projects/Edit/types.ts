import moment from "moment";
/** Project Form Steps or Tabs 
 * @enum `basic_info` - Basic Info Tab
 * @enum `deadline_info` - Deadline Info Tab
*/
export enum ProjectFormSteps {
  basic_info = "basic_info",
  deadline_info = "deadline_info",
}

/** Types for Basic Info Form */
export type EditBasicInfoFormTypes = {
  title: string,
  clientId: number;
  projectTypeId: number;
  submissionById: number;
  clientRepresentativeId: number;
  referenceNumber: string;
  xeroReference: string;
}

/** Types for Deadline Info Form */
export type EditDeadlineInfoFormTypes = {
  deadlineValue?: "7_days" | "15_days" | "30_days" | "45_days" | "90_days" | "custom"
  priority: string;
  instructions: string;
  projectFilesLink: string;
  projectInchargeId: number;
  supportEngineersId: number[];
  startDate: string;
  endDate: string;
  rangePicker?: [moment.Moment, moment.Moment];
  projectFilesLinkName: string;
}

export type EditProjectMenuTypes = {
  currentTab: keyof typeof ProjectFormSteps;
  onTabClick: (tab: keyof typeof ProjectFormSteps) => void;
  completedTabs: Array<keyof typeof ProjectFormSteps>;
};

export type EditProjectBodyWrapProps = {
  headings: {
    heading: string;
    subHeading: string;
    description: string;
    buttonText: string;
  };
  children: React.ReactNode;
  onBackClick?: () => void;
  showBackButton?: boolean;
};