import type { FC } from 'react';
import { Typography } from '../../../../Atoms';
import styles from '../styles.module.scss';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
import { YallahDashboardTypes } from '../../../../../Modules/User/types';
// import { PropertyStatus } from '../../../../../helpers/commonEnums';
import { capitalize } from '../../../../../helpers/common';

interface PropertiesAnalyticsProps {
    property: YallahDashboardTypes["property"]
}

const printLabel = (values: any) => {
    return Intl.NumberFormat("en").format(values.value);
}

const renderLegend = (props: any) => {
    const { payload } = props;

    return (
        <ul
            style={{
                listStyle: "none",
                padding: "0px"
            }}
        >
            {payload.map((entry: any, index: number) => (
                <li key={`item-${index}`}
                    style={{ color: entry.color }}
                >
                    <span
                        style={{
                            height: "15px",
                            width: "15px",
                            marginRight: "10px",
                            display: "inline-block",
                            backgroundColor: entry.color
                        }}
                    ></span>
                    <span>
                        {capitalize(entry.value)} : {entry?.payload?.payload?.value}
                    </span>
                </li>
            ))}
        </ul>
    );
}

const PropertiesAnalytics: FC<PropertiesAnalyticsProps> = ({ property }) => {
    // get the width of the device
    const width = window.innerWidth;

    const chartData = property?.map((item) => {
        return {
            name: "Unknown",
            value: item._count
        }
    });

    const COLORS = ["rgb(230, 138, 0)", "var(--color-green-yp)", "#B7C4CF", "var(--color-blue-yp)"];

    return (
        <div className={styles.credit_analytics}>
            <div className={styles.credit_analytics_header}>
                <Typography color={'dark-main'} size={'md'}>
                    Properties Analytics
                </Typography>
                <Typography color='dark-sub' size={'sm'} className='mt-3 mb-4'>
                    This is a summary of the properties by status
                </Typography>
            </div>

            <div className={styles.credit_analytics_chart}>
                <div>
                    <ResponsiveContainer width="100%" height={width > 767 ? 250 : 400}>
                        <PieChart>
                            <Legend
                                layout='vertical'
                                align={width > 767 ? "left" : "center"}
                                verticalAlign={width > 767 ? "middle" : "bottom"}
                                content={renderLegend}

                                wrapperStyle={{
                                    marginLeft: width > 767 ? "3rem" : "0px",
                                }}
                            />
                            <Pie
                                label={printLabel}
                                labelLine={false}
                                data={chartData}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={2}
                                cx={width > 767 ? "55%" : "50%"}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
}
export default PropertiesAnalytics;