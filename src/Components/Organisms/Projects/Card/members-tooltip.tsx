import type { FC, ReactNode } from 'react';
import { Popover } from 'antd';
import { ProjectMember, ProjectTypes } from '@modules/Project/types';
import { ProjectRoleEnum } from '@helpers/commonEnums';
import styles from './styles.module.scss';

interface MembersTooltipProps {
  memberInCharge: ProjectMember
  supportEngineers: ProjectMember[]
  allClients: ProjectTypes['ProjectClient']
  children: ReactNode
}

const MembersTooltip: FC<MembersTooltipProps> = (props) => {
  const { memberInCharge, supportEngineers, allClients, children } = props;

  return (
    <Popover
      trigger="hover"
      content={(
        <div className={styles.project_item_footer_members_popover}>
          {memberInCharge?.User && (
            <div className={styles.project_item_footer_members_popover_item}>
              <strong className={styles.project_item_footer_members_popover_item_title}>
                Project Incharge
              </strong>
              <br />
              {`${memberInCharge?.User?.firstName} ${memberInCharge?.User?.lastName}`}
            </div>
          )}

          {/** Support Engineers */}
          {supportEngineers?.length > 0 && (
            <div className={styles.project_item_footer_members_popover_item}>
              <strong className={styles.project_item_footer_members_popover_item_title}>
                Support Engineers
              </strong>
              {supportEngineers?.map((member, idx) => (
                <div key={`support-engineer-${idx}`}>
                  {`${idx + 1}. ${member.User.firstName} ${member.User.lastName}`}
                </div>
              ))}
            </div>
          )}

          {/** Clients and their representatives */}
          {allClients?.length > 0 && (
            <div className={styles.project_item_footer_members_popover_item}>
              <strong className={styles.project_item_footer_members_popover_item_title}>
                Clients
              </strong>
              {allClients?.map((member, idx) => (
                <div key={`client-${idx}`}>
                  {`${idx + 1}. ${member.Client.name}`}

                  {member.isRepresentative === true && (
                    <span>
                      (Representative)
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    >
      {children}
    </Popover>
  );
}
export default MembersTooltip;