import { Empty } from "antd";
import { FC, useMemo } from "react";
import {
    ComposedChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Bar,
    ResponsiveContainer,
} from "recharts";
import { monthFinder } from "../../../../helpers/constants";
// import { PriceFinderRespTypes } from "../../../../Modules/PriceFinder/types";
import styles from "./styles.module.scss";

interface PriceFinderAnalyticsProps {
    data: any[]
    filters: {
        propertyCategory: string;
        propertyType: string;
        beds: string;
        completionStatus: string;
        areaNames: string[];
    }
}

const PriceFinderAnalytics: FC<PriceFinderAnalyticsProps> = ({ data, filters }) => {
    // 1 meter = 10.7639 sqft
    const meterToSqft = 10.7639;

    // checks if the property category is for rent or for sale
    const isTypeSale = useMemo(() => {
        const category = filters.propertyCategory
        if (category === 'commercial-for-rent' || category === 'residential-for-rent') {
            return false;
        }
        return true
    }, [filters.propertyCategory])

    const CustomTooltip = ({ payload, label }: any) => {
        let price;
        if (isTypeSale) {
            price = payload[1]?.payload?.averageCostPerMeter / meterToSqft;
        } else {
            price = payload[1]?.payload?.averagePrice
        }

        return (
            <div className={styles.tooltipWrap}>
                <p className={styles.tooltipLabel}>{`${monthFinder.find(month => month.id === label)?.title} - ${payload[0]?.payload.year}`}</p>
                <div className="px-2">
                    <p className={styles.tooltipFirst}>Avg. Price: {Intl.NumberFormat("en", { notation: "standard", }).format(price?.toFixed(0))}</p>
                    <p className={styles.tooltipSecond}>Properties {(isTypeSale) ? 'Sold' : 'Rented'}: {payload[0]?.value}</p>
                </div>
            </div>
        )
    }

    const renderColorfulLegendText = (value: string, entry: any) => {
        const { color } = entry;
        return value.toLowerCase() === "volume" ? <span style={{ color: "#ababab" }}>{value}</span> : <span style={{ color }}>{value}</span>;
    };

    return (
        <section>
            <div className={styles.analyticsWrap}>
                <h1 className="color-dark-main font-size-md">Price &amp; Trends</h1>
                {data?.length > 0 ? (
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <ComposedChart
                                data={data}
                                margin={{
                                    top: 5,
                                    right: 20,
                                    bottom: 0,
                                    left: 10,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    tickFormatter={val => monthFinder.find(month => month.id === val)?.title || "month"}
                                    // tick={{ stroke: '#00A884', strokeWidth: 0.5 }}
                                    dataKey="month"
                                    reversed
                                />
                                <YAxis
                                    tickFormatter={val => Intl.NumberFormat("en", { notation: "compact" }).format(isTypeSale ? (val / meterToSqft) : val)}
                                    yAxisId="left"
                                    label={{
                                        value: isTypeSale ? 'Average price in AED per sqft' : 'Average price in AED',
                                        angle: -90,
                                        position: {
                                            x: 8,
                                            y: "15%",
                                        },
                                    }}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    label={{
                                        value: `No. of properties ${isTypeSale ? 'sold' : 'rented'}`,
                                        angle: -90,
                                        position: {
                                            x: 70,
                                            y: "15%",
                                        },
                                    }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend formatter={renderColorfulLegendText} />

                                <Bar
                                    name="Volume"
                                    barSize={20}
                                    yAxisId="right"
                                    dataKey="aggregatedFrom"
                                    fill="#ccc"
                                />
                                <Line
                                    activeDot={{ r: 8 }}
                                    strokeWidth={1.5}
                                    name="Price"
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey={(isTypeSale) ? 'averageCostPerMeter' : 'averagePrice'}
                                    stroke="#00A884"
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <Empty
                        image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                        imageStyle={{ height: 150 }}
                        description={<span>No Data Found</span>}
                    />
                )}
            </div>
        </section>
    )
}
export default PriceFinderAnalytics;