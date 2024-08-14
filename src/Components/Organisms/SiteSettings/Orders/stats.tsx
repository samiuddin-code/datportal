import type { FC } from 'react';
import { Typography } from '../../../Atoms';

interface OrderStatsProps {
    src: string;
    title: string;
    description: string
}

const OrderStats: FC<OrderStatsProps> = ({ src, title, description }) => {
    return (
        <div className='d-flex align-center'>
            <div>
                <img
                    src={src}
                    alt={'Icon'}
                    width={40}
                    height={40}
                />
            </div>
            <div className='d-flex flex-column ml-2'>
                <Typography color='dark-main' size='md'>{title}</Typography>
                <p className='font-size-xs mb-0 color-dark-sub'>{description}</p>
            </div>
        </div>
    );
}
export default OrderStats;