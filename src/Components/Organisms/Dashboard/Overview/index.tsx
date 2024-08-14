import { FC, Fragment, ReactNode, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Typography } from '../../../Atoms';
import { ClipboardTagIcon, FeedbackIcon } from '../../../Icons';
import styles from './styles.module.scss';
import Layout from '../../../Templates/Layout';
import NotificationModal from '../../NotificationModal';
import { CardWithIcon, TaskOverview } from './Cards';
import { DelayedProjects, ProjectsCard } from './Cards/Projects';
import { DashboardElementModule } from '@modules/DashboardElement';
import { useFetchData } from 'hooks';
import Skeletons from '@organisms/Skeletons';
import { ContentType } from '@modules/DashboardElement/types';
import { DashboardElementSlugs } from '@helpers/commonEnums';



interface DashboardOverviewProps {}

type DashboardElementsType = {
  element?: ReactNode
}

type DashboardElementsDataType = {
  elements: (keyof typeof DashboardElementSlugs)[],
  content: ContentType
}

type ElementsType = {
  slug: string,
  element: ReactNode
}

const DashboardOverview: FC<DashboardOverviewProps> = () => {
  const [dashboardElements, setDashboardElements] = useState<DashboardElementsType[]>([]);
  const module = useMemo(() => new DashboardElementModule(), []);

  const { data, loading } = useFetchData<DashboardElementsDataType>({ method: module.getDashboardContent });

  const [elements, setElements] = useState<ElementsType[]>([]);

  useEffect(() => {
    if (!loading && data?.content) {
      setElements([
        {
          slug: "pending_project_as_project_incharge",
          element: (
            <Link to={"/projects"} style={{ width: 'calc(25% - 1rem)' }}>
              <CardWithIcon
                title={data?.content.pending_project_as_project_incharge?.data || 0}
                subtitle='Pending Project InCharge'
                icon={<ClipboardTagIcon width={50} height={50} />}
              />
            </Link>
          )
        },
        {
          slug: "pending_project_as_support_engineer",
          element: (
            <Link to={"/projects"} style={{ width: 'calc(25% - 1rem)' }}>
              <CardWithIcon
                title={data?.content?.pending_project_as_support_engineer?.data || 0}
                subtitle='Pending Project As Support Engineer'
                icon={<ClipboardTagIcon width={50} height={50} />}
              />
            </Link>
          )
        },
        {
          slug: "pending_project_as_support_engineer",
          element: (
            <Link to={"/tasks"} style={{ width: 'calc(25% - 1rem)' }}>
              <CardWithIcon
                title={data?.content.pending_project_as_support_engineer?.data || 0}
                subtitle='Pending Task Assigned To Me'
                icon={<ClipboardTagIcon width={50} height={50} />}
              />
            </Link>
          )
        },
        {
          slug: "notification",
          element: <NotificationModal dropdown={false} fetch />
        },
        {
          slug: "all_tasks",
          element: <TaskOverview />
        },
        {
          slug: "active_projects",
          element: <ProjectsCard link="/projects?all=true" showStatus title='Active Projects' data={data?.content?.active_projects?.data} />
        },
        {
          slug: "delayed_projects",
          element: <DelayedProjects data={data?.content?.delayed_projects?.data} />
        },
        {
          slug: "close_out_projects",
          element: <ProjectsCard link="/projects?isClosed=true" title='Closed Out Projects' data={data?.content?.close_out_projects?.data} />
        },
        {
          slug: "on_hold_projects",
          element: <ProjectsCard link="/projects?onHold=true" showStatus title='On Hold Projects' data={data?.content?.on_hold_projects?.data} />
        },
        {
          slug: "ready_for_submission",
          element: <ProjectsCard title='Ready For Submission Projects' data={data?.content?.ready_for_submission?.data} />
        },
        {
          slug: "new_project",
          element: <ProjectsCard link="/projects" title='New Projects' data={data?.content?.new_project?.data} />
        },
        {
          slug: "approved_projects",
          element: <ProjectsCard link="/projects?isClosed=false" title='Approved Projects' data={data?.content?.approved_projects?.data} />
        },
        {
          slug: "active_employees",
          element: (
            <Link to={"/employees"} style={{ width: 'calc(25% - 1rem)' }}>
              <CardWithIcon
                title={data?.content?.active_employees?.data || 0}
                subtitle='Active Employees'
                icon={<ClipboardTagIcon width={50} height={50} />}
              />
            </Link>
          )
        },
        {
          slug: "closed_projects",
          element: <ProjectsCard title='Closed Projects' data={data?.content?.closed_projects?.data} />
        },
        {
          slug: "active_quotations",
          element: (
            <Link to={"/quotations"} style={{ width: 'calc(25% - 1rem)' }}>
              <CardWithIcon
                title={data?.content?.active_quotations?.data || 0}
                subtitle='Active Quotations'
                icon={<ClipboardTagIcon width={50} height={50} />}
              />
            </Link>
          )
        },
        {
          slug: "pending_invoices",
          element: (
            <Link to={"/invoice"} style={{ width: 'calc(25% - 1rem)' }}>
              <CardWithIcon
                title={data?.content?.pending_invoices?.data || 0}
                subtitle='Pending Invoices'
                icon={<ClipboardTagIcon width={50} height={50} />}
              />
            </Link>
          )
        },
        {
          slug: "active_enquiries",
          element: (
            <Link to={"/enquiries"} style={{ width: 'calc(25% - 1rem)' }}>
              <CardWithIcon
                title={data?.content?.active_enquiries?.data || 0}
                subtitle='Active Enquiries'
                icon={<ClipboardTagIcon width={50} height={50} />}
              />
            </Link>
          )
        },
        {
          slug: "active_leads",
          element: (
            <Link to={"/leads"} style={{ width: 'calc(25% - 1rem)' }}>
              <CardWithIcon
                title={data?.content?.active_leads?.data || 0}
                subtitle='Active Leads'
                icon={<ClipboardTagIcon width={50} height={50} />}
              />
            </Link>
          )
        },
        {
          slug: "active_reimbursement",
          element: (
            <Link to={"/employee-requests/reimbursement-requests"} style={{ width: 'calc(25% - 1rem)' }}>
              <CardWithIcon
                title={data?.content?.active_reimbursement?.data || 0}
                subtitle='Active Reimbursements'
                icon={<ClipboardTagIcon width={50} height={50} />}
              />
            </Link>
          )
        },
        {
          slug: "active_leave_request",
          element: (
            <Link to={"/employee-requests/leave-requests"} style={{ width: 'calc(25% - 1rem)' }}>
              <CardWithIcon
                title={data?.content?.active_leave_request?.data || 0}
                subtitle='Active Leave Requests'
                icon={<ClipboardTagIcon width={50} height={50} />}
              />
            </Link>
          )
        },
        {
          slug: "active_cash_advance_request",
          element: (
            <Link to={"/employee-requests/cash-advance-requests"} style={{ width: 'calc(25% - 1rem)' }}>
              <CardWithIcon
                title={data?.content?.active_cash_advance_request?.data || 0}
                subtitle='Active Cash Advance Requests'
                icon={<ClipboardTagIcon width={50} height={50} />}
              />
            </Link>
          )
        },
        {
          slug: "permits_expiring",
          element: (
            <Link to={"/permits"} style={{ width: 'calc(25% - 1rem)' }}>
              <CardWithIcon
                title={data?.content?.permits_expiring?.data || 0}
                subtitle='Expiring Permits'
                icon={<ClipboardTagIcon width={50} height={50} />}
              />
            </Link>
          )
        },
        {
          slug: "government_fees_to_collect",
          element: (
            <Link to={"/transactions"} style={{ width: 'calc(25% - 1rem)' }}>
              <CardWithIcon
                title={data?.content?.government_fees_to_collect?.data || 0}
                subtitle='Government Fees To Collect'
                icon={<ClipboardTagIcon width={50} height={50} />}
              />
            </Link>
          )
        },
      ])
    }
  }, [data])


  useEffect(() => {
    if (!dashboardElements?.length && elements.length) {
      const _temp: DashboardElementsType[] = data?.elements?.map(item => ({
        element: elements.find(element => element.slug === item)?.element,
      })) || [];

      setDashboardElements(_temp);
    }
  }, [elements, dashboardElements, data])

  return (
    <Layout className={styles.dashboardBody}>
      <Typography color='dark-main' size='lg' weight='semi' className='ml-4 mb-4'>
        Overview
      </Typography>

      <div className={styles.overview}>
        {loading ? (
          <>
            <div style={{ background: '#fafafa', padding: 10 }}>
              <Skeletons items={4} span={6} />
            </div>
            <div style={{ background: '#fafafa', padding: 10, marginTop: 20 }}>
              <Skeletons items={2} span={12} paragraph={{ rows: 8 }} />
            </div>
            <div style={{ background: '#fafafa', padding: 10, marginTop: 20 }}>
              <Skeletons items={4} span={6} />
            </div>
          </>
        ) : (
          <div className={styles.cards}>
            {dashboardElements.map((element, index) => (
              <Fragment key={`dashboard-element-${index}`}>
                {element.element}
              </Fragment>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
export default DashboardOverview;