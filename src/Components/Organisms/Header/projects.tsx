import { CSSProperties, FC, useState } from 'react';
import { Button, Divider, Dropdown, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import styles from './style.module.scss';
import { ProCard } from '@ant-design/pro-components';
import { Link } from 'react-router-dom';

interface ProjectsDropDownProps { }

const ProjectsDropDown: FC<ProjectsDropDownProps> = () => {
    const [open, setOpen] = useState<boolean>(false);
    const overlayStyle: CSSProperties = { width: 450 }

    return (
        <Dropdown
            trigger={['click']}
            overlayStyle={overlayStyle}
            open={open}
            onOpenChange={(open) => setOpen(open)}
            dropdownRender={() => (
                <div className={styles.overlay}>
                    <ProCard
                        title={
                            <div className={styles.projects_title}>
                                Recents
                            </div>
                        }
                        className={styles.projects_card}
                    >
                        <div className={styles.projects_card_item}>Project 1</div>
                        <div className={styles.projects_card_item}>Project 2</div>
                        <div className={styles.projects_card_item}>Project 3</div>
                        <Divider className='my-1' />
                        <div className={styles.projects_card_item}>View All</div>
                        <div className={styles.projects_card_item}>Assign Project</div>
                    </ProCard>
                </div>
            )}
        >
            <Button type='text' className={styles.projects}>
                <Space>
                    Projects
                    <DownOutlined />
                </Space>
            </Button>
        </Dropdown>
    )
}

export default ProjectsDropDown;