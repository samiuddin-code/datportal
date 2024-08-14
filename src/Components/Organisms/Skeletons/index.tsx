import { FC, useMemo } from 'react';
import { Row, Col, Skeleton } from "antd";
import { SkeletonParagraphProps } from 'antd/lib/skeleton/Paragraph';

interface SkeletonProps {
  items: number;
  fullWidth?: boolean;
  span?: number;
  paragraph?: SkeletonParagraphProps
}

// a skeleton component that takes in a number of items to render
const Skeletons: FC<SkeletonProps> = ({ items = 1, fullWidth = true, span, paragraph }) => {
  const finalSpan = useMemo(() => {
    if (span) {
      return span
    }
    if (fullWidth) {
      return 24
    }
    return 12
  }, [fullWidth, span])

  return (
    <Row gutter={[24, 24]}>
      {Array(items).fill(0).map((_, index) => (
        <Col key={index} span={finalSpan}>
          <Skeleton active paragraph={paragraph} />
        </Col>
      ))}
    </Row>
  )
}

export default Skeletons