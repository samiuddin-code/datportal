import { CSSProperties, FC, ReactNode, useState } from 'react';
import { Dropdown } from 'antd';
import {
    NavigatorIcon, BuildingIcon, DocumentIcon, UserIcon,
    DrawingIcon, TaskIcon, DepartmentIcon, ProjectIcon,
} from '@icons/';
import styles from './style.module.scss';

type MenuItemProps = {
    label: string,
    icon: ReactNode,
    onClick?: () => void,
    disabled?: boolean,
}


const Item: FC<MenuItemProps> = ({ label, icon, onClick, disabled = false }) => {
    return (
        <div
            className={styles.item}
            style={{
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
            }}
            onClick={() => {
                if (!disabled && onClick) {
                    onClick();
                }
            }}
        >
            <div className={styles.icon}>{icon}</div>
            <div className={styles.label}>{label}</div>
        </div>
    )
}

const HeaderMenu: FC = () => {
    const [open, setOpen] = useState<boolean>(false);

    const overlayStyle: CSSProperties = { width: 350 }

    const items: MenuItemProps[] = [
        {
            label: 'Authorities',
            icon: <BuildingIcon />
        },
        {
            label: 'Task',
            icon: <DocumentIcon />
        },
        {
            label: 'Users',
            icon: <UserIcon multiple />
        },
        {
            label: 'Send Updates',
            icon: <DocumentIcon />
        },
        {
            label: 'Drawings',
            icon: <DrawingIcon />
        },
        {
            label: 'Task State',
            icon: <TaskIcon />
        },
        {
            label: 'Project Type',
            icon: <ProjectIcon />
        },
        {
            label: 'Department',
            icon: <DepartmentIcon />
        },
        {
            label: 'Project State',
            icon: <ProjectIcon />
        }
    ];

    return (
        <Dropdown
            trigger={['click']}
            overlayStyle={overlayStyle}
            open={open}
            onOpenChange={(open) => setOpen(open)}
            dropdownRender={() => (
                <div className={styles.overlay}>
                    <div className={styles.header_menu}>
                        {items.map((item, index) => (
                            <Item
                                key={`header-menu-item-${index}`}
                                label={item.label}
                                icon={item.icon}
                                onClick={() => {
                                    if (item.onClick) {
                                        item.onClick();
                                        setOpen(false);
                                    }
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}
        >
            <NavigatorIcon style={{ cursor: 'pointer' }} />
        </Dropdown>
    )
}

export default HeaderMenu;