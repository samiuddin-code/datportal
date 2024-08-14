import { useEffect, useState, FormEvent, useCallback, useMemo } from "react";
import { Empty, message, } from "antd";
import Layout from "../../../Templates/Layout";
import TableComponent from "./table-columns";
import PriceFinderAnalytics from "./analytics";
import { PageHeader, CustomFilter, Pagination } from "../../../Atoms";
import Skeletons from "../../Skeletons";
// import { PriceFinderModule } from "../../../../Modules/PriceFinder";
import { PropertyCategoryModule } from "../../../../Modules/PropertyCategory";
import { PropertyCategoryType } from "../../../../Modules/PropertyCategory/types";
import { PropertyType } from "../../../../Modules/PropertyType/types";
import { PropertyTypeModule } from "../../../../Modules/PropertyType";
// import { DLDTransactionModule } from "../../../../Modules/DLD-Transaction";
// import { DLDRentTransactionModule } from "../../../../Modules/DLD-Rent-Transaction";
// import { DLDTransactionResponseObject } from "../../../../Modules/DLD-Transaction/types";
// import { DLDRentTransactionResponseObject } from "../../../../Modules/DLD-Rent-Transaction/types";
import { useDebounce } from "../../../../helpers/useDebounce";
import { Bedrooms, CompletionStatus } from "../../../../helpers/propertyEnums";
import styles from '../../Common/styles.module.scss'
import { LocationModule } from "../../../../Modules/Location";
import { LocationType } from "../../../../Modules/Location/types";

const breadCrumbsData = [
    {
        text: "Home",
        isLink: true,
        path: "/",
    },
    {
        isLink: false,
        text: "Price Finder",
    },
];

function PriceFinder() {
    //const module = useMemo(() => new PriceFinderModule(), [])
    const propertyModule = useMemo(() => new PropertyCategoryModule(), [])
    const propertyTypeModule = useMemo(() => new PropertyTypeModule(), [])
    // const dldTransactionModule = useMemo(() => new DLDTransactionModule(), [])
    // const dldRentTransactionModule = useMemo(() => new DLDRentTransactionModule(), [])
    const locationModule = useMemo(() => new LocationModule(), [])

    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [locations, setLocations] = useState<{
        data: LocationType[];
        loading: boolean;
    }>({
        data: [],
        loading: false,
    });
    const [reset, setReset] = useState<boolean>(false);

    const [moduleData, setModuleData] = useState<any>({
        loading: false,
        error: {},
        data: [],
    });

    // DLD Transaction Data
    const [tableData, setTableData] = useState<any>({
        loading: false,
        error: {},
        data: [],
    });

    // DLD Rent Transaction Data
    const [tableRentData, setTableRentData] = useState<any>({
        loading: false,
        error: {},
        data: [],
    });

    const [propertyCategories, setPropertyCategories] = useState<{ data: PropertyCategoryType[]; loading: boolean }>({
        data: [],
        loading: false
    });

    const [propertyType, setPropertyType] = useState<{ data: PropertyType[]; loading: boolean }>({
        data: [],
        loading: false
    });

    const [selectedFilters, setSelectedFilters] = useState<{
        propertyCategory: string;
        propertyType: string;
        beds: string;
        completionStatus: string;
        areaNames: string[];
    }>({
        propertyCategory: "residential-for-rent",
        propertyType: "",
        beds: "",
        completionStatus: "",
        areaNames: [],
    });

    // checks if the property category is for rent or for sale
    const isTypeSale = useMemo(() => {
        const category = selectedFilters.propertyCategory
        if (category === 'commercial-for-rent' || category === 'residential-for-rent') {
            return false;
        }
        return true
    }, [selectedFilters.propertyCategory])

    const onSearch = (event: FormEvent<HTMLInputElement>) => {
        const value = event.currentTarget.value
        setSearchTerm(value);
    }

    const onLocationSearch = useCallback(() => {
        if (debouncedSearchTerm) {
            setLocations({ ...locations, loading: true })
            locationModule.getAllRecords({ name: debouncedSearchTerm }).then((res) => {
                const data = res?.data?.data
                const prevData = locations.data
                // remove duplicates from the new data
                const newValues = data?.filter((item: LocationType) => prevData?.every((prevItem) => prevItem.id !== item.id))
                // add the new data to the previous data
                setLocations({
                    data: [...newValues, ...prevData],
                    loading: false
                })
            }).catch((err) => {
                message.error(err?.response?.data?.message)
                setLocations({ ...locations, loading: false })
            })
        }
    }, [debouncedSearchTerm, locationModule])

    const onSelected = (event: any) => {
        const { name, value } = event?.target
        // set the selected value in the state 
        setSelectedFilters({ ...selectedFilters, [name]: value });
    }

    const getPropertyCategoriesData = useCallback(() => {
        setPropertyCategories({ ...propertyCategories, loading: true })
        setPropertyType({ ...propertyType, loading: true })
        // get property categories
        propertyModule.getAllRecords().then((res) => {
            setPropertyCategories({
                data: res?.data?.data,
                loading: false
            })
        }).catch((err) => {
            setPropertyCategories({
                ...propertyCategories,
                loading: false
            })
        })
        // get property types
        propertyTypeModule.getAllRecords().then((res) => {
            setPropertyType({ data: res?.data?.data, loading: false })
        }).catch((err) => {
            setPropertyType({ ...propertyType, loading: false })
        })
    }, [propertyModule, propertyTypeModule, propertyCategories, propertyType])

    // Get DLD Transaction Data
    // const onGetDLDTransactionData = useCallback((query?: any) => {
    //     dldTransactionModule.getDLDTransactions(query).then((res) => {
    //         setTableData({
    //             data: res.data?.data,
    //             loading: false,
    //             ...res.data
    //         })
    //     }).catch((error) => {
    //         message.error(error?.response?.data?.message)
    //         setTableData({
    //             ...tableData,
    //             loading: false
    //         })
    //     })
    // }, [dldTransactionModule])

    // Get DLD Rent Transaction Data
    // const onGetDLDRentTransactionData = useCallback((query?: any) => {
    //     dldRentTransactionModule.getDLDRentTransactions(query).then((res) => {
    //         setTableRentData({
    //             data: res.data?.data,
    //             loading: false,
    //             ...res.data
    //         })
    //     }).catch((error) => {
    //         message.error(error?.response?.data?.message)
    //         setTableRentData({
    //             ...tableRentData,
    //             loading: false
    //         })
    //     })
    // }, [dldRentTransactionModule])

    const onUpdate = useCallback(() => {
        const category = selectedFilters?.propertyCategory
        if (category === "") {
            setModuleData({ data: [] })
            return message.error("Required: Please select a category")
        }

        setModuleData({ ...moduleData, loading: true })

        isTypeSale ? setTableData({ ...tableData, loading: true }) : setTableRentData({ ...tableRentData, loading: true })

        const data = {
            propertyCategory: category,
            propertyType: selectedFilters?.propertyType || undefined,
            areaNames: selectedFilters?.areaNames?.length > 0 ? selectedFilters?.areaNames : undefined,
            beds: selectedFilters?.beds || undefined,
            completionStatus: selectedFilters?.completionStatus || undefined,
        }

        // module.getAllRecords(data).then((res: any) => {
        //     setModuleData({
        //         data: res.data?.data,
        //         loading: false,
        //         ...res.data
        //     })
        // }).catch((error: any) => {
        //     message.error(error?.response?.data?.message)
        //     setModuleData({
        //         ...moduleData,
        //         loading: false
        //     })
        // })

        const dldData = {
            propertyCategory: category,
            propertyType: selectedFilters?.propertyType || undefined,
            area: selectedFilters?.areaNames?.length > 0 ? selectedFilters?.areaNames : undefined,
            beds: selectedFilters?.beds || undefined,
            completionStatus: selectedFilters?.completionStatus || undefined,
        }

        // Get DLD Data
        // isTypeSale ? onGetDLDTransactionData(dldData) : onGetDLDRentTransactionData(dldData)
    }, [selectedFilters, module, isTypeSale])

    useEffect(() => {
        getPropertyCategoriesData();
        onUpdate()
    }, [])

    const onPaginationChange = useCallback((page: number, pageSize: number) => {
        setTableData({ ...tableData, loading: true });

        const params = {
            page: page,
            perPage: pageSize,
            propertyCategory: selectedFilters?.propertyCategory || undefined,
            propertyType: selectedFilters?.propertyType || undefined,
            area: selectedFilters?.areaNames?.length > 0 ? selectedFilters?.areaNames : undefined,
            beds: selectedFilters?.beds || undefined,
            completionStatus: selectedFilters?.completionStatus || undefined,
        };

        //isTypeSale ? onGetDLDTransactionData(params) : onGetDLDRentTransactionData(params)
    }, [tableData, selectedFilters, debouncedSearchTerm]);

    useEffect(() => {
        onLocationSearch()
    }, [onLocationSearch])

    useEffect(() => {
        if (reset) {
            onUpdate();
        }
        // after 2 seconds set reset clicked state to false
        const timer = setTimeout(() => {
            setReset(false)
        }, 2000);
        return () => clearTimeout(timer);
    }, [reset, selectedFilters, onUpdate])

    return (
        <Layout>
            <PageHeader
                heading="Price Finder"
                breadCrumbData={breadCrumbsData}
                filters={
                    <div className={styles.filterWrapper}>
                        <CustomFilter
                            type="multiSelect"
                            label="Location"
                            name="areaNames"
                            withSearch={true}
                            options={locations?.data?.map((item) => ({
                                label: item?.localization?.[0]?.name,
                                value: item.localization[0].name,
                            }))}
                            onChange={(value) => {
                                setSelectedFilters({
                                    ...selectedFilters,
                                    areaNames: value
                                })
                            }}
                            onReset={() => {
                                setReset(true)
                                setSelectedFilters({ ...selectedFilters, areaNames: [] })
                                // Reset search term
                                setSearchTerm("")
                            }}
                            onUpdate={onUpdate}
                            // START: For search
                            loading={locations.loading}
                            searchTerm={searchTerm}
                            onSearch={onSearch}
                            selectedData={selectedFilters?.areaNames}
                            removeSelectedData={(value) => {
                                setSelectedFilters({
                                    ...selectedFilters,
                                    areaNames: selectedFilters?.areaNames?.filter((item) => item !== value)
                                })
                            }}
                        // END: For search
                        />
                        <div>
                            <CustomFilter
                                type="radio"
                                label="Category"
                                name="propertyCategory"
                                options={[]}
                                value={selectedFilters?.propertyCategory}
                                onChange={onSelected}
                                onReset={() => {
                                    setSelectedFilters({ ...selectedFilters, propertyCategory: "" })
                                    onUpdate()
                                }}
                                onUpdate={onUpdate}
                                defaultValue={propertyCategories?.data ? "residential-for-rent" : ""}
                                canReset={false}
                            />
                        </div>
                        <div>
                            <CustomFilter
                                type="radio"
                                label="Property Type"
                                name="propertyType"
                                options={propertyType?.data?.map((item) => ({
                                    label: item.localization[0].title as string,
                                    value: item.slug,
                                }))}
                                value={selectedFilters?.propertyType}
                                onChange={onSelected}
                                onReset={() => {
                                    setSelectedFilters({ ...selectedFilters, propertyType: "" })
                                    onUpdate()
                                }}
                                onUpdate={onUpdate}
                            />
                        </div>
                        <div>
                            <CustomFilter
                                type="radio"
                                label="Bedrooms"
                                options={Object.entries(Bedrooms).filter(([item]) => item !== "N/A").map(([key, value]) => ({
                                    label: value,
                                    value: value,
                                }))}
                                value={selectedFilters?.beds}
                                name="beds"
                                onChange={onSelected}
                                onReset={() => {
                                    setSelectedFilters({ ...selectedFilters, beds: "" })
                                    onUpdate()
                                }}
                                onUpdate={onUpdate}
                            />
                        </div>
                        <div>
                            <CustomFilter
                                type="radio"
                                label="Completion Status"
                                options={Object.entries(CompletionStatus).map(([key, value]) => ({
                                    label: key,
                                    value: value,
                                }))}
                                value={selectedFilters?.completionStatus}
                                name="completionStatus"
                                onChange={onSelected}
                                onReset={() => {
                                    setSelectedFilters({ ...selectedFilters, completionStatus: "" })
                                    onUpdate()
                                }}
                                onUpdate={onUpdate}
                            />
                        </div>
                    </div>
                }
            />
            {moduleData?.loading ? (
                <Skeletons items={5} fullWidth />
            ) : (
                <>
                    <PriceFinderAnalytics
                        data={moduleData?.data}
                        filters={selectedFilters}
                    />

                    <h2 className="color-dark-main font-size-md mb-0">Transactions</h2>
                    <TableComponent
                        tableData={isTypeSale ? tableData?.data : tableRentData?.data}
                        tableLoading={isTypeSale ? tableData?.loading : tableRentData?.loading}
                        emptyText={<Empty className='py-2' description={<span>No Transactions Found</span>} />}
                        isTypeSale={isTypeSale}
                    />

                    <Pagination
                        total={isTypeSale ? tableData?.meta?.total! : tableRentData?.meta?.total!}
                        current={isTypeSale ? tableData?.meta?.page! : tableRentData?.meta?.page!}
                        defaultPageSize={(isTypeSale) ? tableData?.meta?.perPage! : tableRentData?.meta?.perPage!}
                        pageSizeOptions={[10, 20, 50, 100]}
                        onChange={onPaginationChange}
                    />
                </>
            )}
        </Layout>
    );
}
export default PriceFinder;
