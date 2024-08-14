import { Empty } from 'antd';
import type { FC, CSSProperties } from 'react';

interface CustomEmptyProps {
  description: string
  imageStyle?: CSSProperties
  className?: string
}

const CustomEmpty: FC<CustomEmptyProps> = (props) => {
  const { description, imageStyle, className } = props;

  return (
    <Empty
      image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
      imageStyle={{
        height: imageStyle?.height || 100,
        ...imageStyle
      }}
      description={<span> {description || 'No data found'}</span>}
      className={className}
    />
  );
}
export default CustomEmpty;