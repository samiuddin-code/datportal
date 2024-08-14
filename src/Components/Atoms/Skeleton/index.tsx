import { FC } from 'react';
import { Skeleton } from 'antd';

const CustomSkeleton: FC = () => {
    return <Skeleton.Input active size={'default'} block />

}
export default CustomSkeleton;