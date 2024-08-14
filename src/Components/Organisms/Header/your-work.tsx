import { CSSProperties, FC, ReactNode, useState } from 'react';
import { Button, Dropdown, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import styles from './style.module.scss';
import { ProCard } from '@ant-design/pro-components';
import { TabType } from '../Dashboard/Overview/Cards/Tasks/types';

interface YourWorkDropDownProps { }

const YourWorkDropDown: FC<YourWorkDropDownProps> = () => {
    const [open, setOpen] = useState<boolean>(false);
    const [tab, setTab] = useState<TabType>("assigned_to_me");
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
                        tabs={{
                            tabPosition: "top",
                            activeKey: tab,
                            onChange: (key) => setTab(key as TabType),
                            items: [
                                {
                                    label: "Assigned To Me",
                                    key: "assigned_to_me",
                                    children: (
                                        <p>Assigned To Me</p>
                                    )
                                },
                                {
                                    label: "Assigned By Me",
                                    key: "assigned_by_me",
                                    children: (
                                        <p>Assigned By Me</p>
                                    )
                                },
                            ],
                        }}
                    />
                </div>
            )}
        >
            <Button type='text' className={styles.your_work}>
                <Space>
                    Your Work
                    <DownOutlined />
                </Space>
            </Button>
        </Dropdown>
    )
}

export default YourWorkDropDown;