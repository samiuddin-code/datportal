import { FC, ReactNode } from 'react';
import { Typography } from '../../../../Atoms';
import styles from '../styles.module.scss';

interface CardWithIconProps {
    title: string | number;
    subtitle: string;
    lightSubtitle?: boolean;
    description?: ReactNode;
    icon: ReactNode;
}

const CardWithIcon: FC<CardWithIconProps> = ({ title, subtitle, description, icon, lightSubtitle }) => {
    return (
        <div className={styles.card}>
            <div className={styles.card_content}>
                <Typography color='dark-main' size='xxl' weight='bold'>
                    {`${title}`}
                </Typography>
                <Typography
                    color={lightSubtitle ? "dark-sub" : "dark-main"}
                    type='h5' weight='semi' className='mt-4'
                >
                    {subtitle}
                </Typography>
                {description && (
                    <div className='font-size-xs color-dark-sub mb-0'>
                        {description}
                    </div>
                )}
            </div>
            <div className={styles.card_icon}>{icon}</div>
        </div>
    );
}
export default CardWithIcon;