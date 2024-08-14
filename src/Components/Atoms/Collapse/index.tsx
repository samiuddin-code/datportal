import { Collapse } from "antd";
import { propsType } from "./collapse";
const { Panel } = Collapse;


export const Accordian = (props: propsType) => {
  const {
    className,
    accordian,
    header,
    children,
    expandIconPosition,
    withPanel,
    defaultActiveKey,
    ...rest
  } = props;
  return (
    <Collapse
      className={className}
      accordion={accordian}
      {...rest}
      expandIconPosition={expandIconPosition}
      defaultActiveKey={[defaultActiveKey]}
      ghost
    >
      {withPanel ? (
        <Panel key={1} header={header}>
          {children}
        </Panel>
      ) : (
        <>{children}</>
      )}
    </Collapse>
  );
};

Accordian.defaultProps = {
  accordian: false,
  header: "",
  expandIconPosition: "end",
  withPanel: true,
  defaultActiveKey:1,
};
