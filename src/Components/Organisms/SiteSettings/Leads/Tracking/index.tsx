import { useEffect, useState, useMemo, useCallback } from "react";
import { CustomFilter, PageHeader, Pagination } from "../../../../Atoms";
import Skeletons from "../../../Skeletons";
import TableComponent from "./table-columns";
import { LeadsResponseObject, PropertiesTrackingTypes } from "../../../../../Modules/Leads/types";
import { LeadsModule } from "../../../../../Modules/Leads";
import styles from '../../Common/styles.module.scss'
// import { LeadsSource, PropertyCategories } from "../../../../../helpers/commonEnums";
import { convertDate } from "../../../../../helpers/dateHandler";
import { LeadsPermissionsEnum } from "../../../../../Modules/Leads/permissions";
import SiteSettingsTemplate from "../../../../Templates/SiteSettings";
import { getPermissionSlugs, isNumber } from "../../../../../helpers/common";
import { message } from "antd";
import { PropertyCategoryModule } from "../../../../../Modules/PropertyCategory";
import { OrganizationModule } from "../../../../../Modules/Organization";
import { useDebounce } from "../../../../../helpers/useDebounce";
import { OrganizationType } from "../../../../../Modules/Organization/types";
import { PropertyCategoryType } from "../../../../../Modules/PropertyCategory/types";
import { CheckboxValueType } from "antd/lib/checkbox/Group";
import MoreCustomFilters from "../../../../Atoms/CustomFilter/more";

const breadCrumbsData = [
    {
        text: "Home",
        isLink: true,
        path: "/",
    },
    {
        isLink: true,
        text: "Site Settings",
        path: "/siteSettings",
    },
    {
        isLink: true,
        text: "Leads",
        path: "/siteSettings/leads",
    },
    {
        isLink: false,
        text: "Tracking",
    },
];

type SelectedFiltersTypes = {
    dateRange?: string[];
    propertyId?: number;
    userAgent?: string;
    userIP?: string;
    propertyUrl?: string;
    source?: any;
    propertyCategory?: any
    organizationId?: number;
    agentId?: number;
}

const LeadsTrackingSettings = () => {
    // available permissions for the properties page
    const permissionSlug = getPermissionSlugs(LeadsPermissionsEnum)
    const propertyCategoryModule = useMemo(() => new PropertyCategoryModule(), [])
    const orgModule = useMemo(() => new OrganizationModule(), []);

    const [moreFilters, setMoreFilters] = useState<CheckboxValueType[]>([]);
    const [moduleData, setModuleData] = useState<Partial<LeadsResponseObject>>({
        loading: false,
        data: [],
    });

    const [orgSearchTerm, setOrgSearchTerm] = useState("");
    const debouncedOrgSearchTerm = useDebounce(orgSearchTerm, 500);

    const [organizationData, setOrganizationData] = useState<Partial<{
        data: OrganizationType[];
        loading: boolean
    }>>({
        data: [],
        loading: false
    });

    const [propertyCategories, setPropertyCategories] = useState<{ data: PropertyCategoryType[]; loading: boolean }>({
        data: [],
        loading: false
    })

    const [selectedFilters, setSelectedFilters] = useState<SelectedFiltersTypes>({
        dateRange: [""],
        propertyId: 0,
        userAgent: "",
        userIP: "",
        propertyUrl: "",
        source: undefined,
        organizationId: 0,
        propertyCategory: undefined,
        agentId: 0
    });

    const [reset, setReset] = useState<boolean>(false);

    const leadsModule = useMemo(() => new LeadsModule(), []);

    const onSelected = (event: any) => {
        const { name, value } = event?.target

        if (name === "organizationId" || name === "propertyId" || name === "agentId") {
            const isValidNumber = isNumber(value)
            if (!isValidNumber) {
                let label: string = "";
                switch (name) {
                    case "organizationId": {
                        label = "Organization ID";
                        break;
                    }
                    case "propertyId": {
                        label = "Property ID";
                        break;
                    }
                    case "agentId": {
                        label = "Agent ID";
                        break;
                    }
                }
                return message.error(`${label} should be a number`)
            }
        }

        // set the selected value in the state 
        setSelectedFilters({
            ...selectedFilters,
            [name]: value
        });
    }

    const onReset = useCallback((name: string, value: number | string | string[]) => {
        if (name) {
            setReset(true);
            setSelectedFilters({ ...selectedFilters, [name]: value });
        }
    }, [selectedFilters]);

    // get the search result for the organization
    const GetSearchResult = useCallback(() => {
        if (debouncedOrgSearchTerm) {
            setOrganizationData((prev) => ({ ...prev, loading: true }));
            orgModule.findPublished({ name: debouncedOrgSearchTerm }).then((res) => {
                const data = res.data?.data as OrganizationType[];
                if (data) {
                    // remove duplicate data
                    const uniqueData = data.filter((item, index) => {
                        return data.findIndex((ele) => ele.id === item.id) === index;
                    });
                    setOrganizationData((prev) => ({ ...prev, data: uniqueData }));
                }
            }).catch((err) => {
                message.error(err?.response?.data?.message || "Something went wrong");
            }).finally(() => {
                setOrganizationData((prev) => ({ ...prev, loading: false }));
            })
        }
    }, [debouncedOrgSearchTerm, orgModule])

    useEffect(() => {
        GetSearchResult()
    }, [GetSearchResult])

    const getData = useCallback(() => {
        propertyCategoryModule.getAllRecords().then((res) => {
            setPropertyCategories(res.data);
        }).catch((err) => {
            setPropertyCategories({ ...propertyCategories, loading: false });
        });
    }, [propertyCategories]);

    useEffect(() => {
        getData();
    }, []);

    const onUpdate = useCallback(() => {
        const fromDateString: string = selectedFilters.dateRange?.[0] || "";
        const toDateString = selectedFilters.dateRange?.[1] || "";
        const fromDate = fromDateString ? convertDate(fromDateString, "yy-mm-dd") : undefined;
        const toDate = toDateString ? convertDate(toDateString, "yy-mm-dd") : undefined;

        const data = {
            propertyId: Number(selectedFilters.propertyId) > 0 ? Number(selectedFilters.propertyId) : undefined,
            propertyUrl: selectedFilters.propertyUrl ? selectedFilters.propertyUrl : undefined,
            source: selectedFilters.source ? selectedFilters.source : undefined,
            userAgent: selectedFilters.userAgent ? selectedFilters.userAgent : undefined,
            userIP: selectedFilters.userIP ? selectedFilters.userIP : undefined,
            fromDate: fromDate,
            toDate: toDate,
            organizationId: Number(selectedFilters.organizationId) > 0 ? Number(selectedFilters.organizationId) : undefined,
            propertyCategory: selectedFilters.propertyCategory ? selectedFilters.propertyCategory : undefined,
            agentId: Number(selectedFilters.agentId) > 0 ? Number(selectedFilters.agentId) : undefined,
        }

        // get the data from the api
        // leadsModule.getTrackingLeads(data).then((response) => {
        //     setModuleData({
        //         ...moduleData,
        //         loading: false,
        //         data: response.data?.data,
        //         meta: response.data?.meta
        //     });
        // });
    }, [selectedFilters, leadsModule])

    const onPaginationChange = useCallback((page: number, pageSize: number) => {
        setModuleData({ ...moduleData, loading: true });

        const fromDateString: string = selectedFilters.dateRange?.[0] || "";
        const toDateString = selectedFilters.dateRange?.[1] || "";
        const fromDate = fromDateString ? convertDate(fromDateString, "yy-mm-dd") : undefined;
        const toDate = toDateString ? convertDate(toDateString, "yy-mm-dd") : undefined;

        const params = {
            page: page,
            perPage: pageSize,
            propertyId: Number(selectedFilters.propertyId) > 0 ? Number(selectedFilters.propertyId) : undefined,
            propertyUrl: selectedFilters.propertyUrl ? selectedFilters.propertyUrl : undefined,
            source: selectedFilters.source ? selectedFilters.source : undefined,
            userAgent: selectedFilters.userAgent ? selectedFilters.userAgent : undefined,
            userIP: selectedFilters.userIP ? selectedFilters.userIP : undefined,
            fromDate: fromDate,
            toDate: toDate,
            organizationId: Number(selectedFilters.organizationId) > 0 ? Number(selectedFilters.organizationId) : undefined,
            propertyCategory: selectedFilters.propertyCategory ? selectedFilters.propertyCategory : undefined,
            agentId: Number(selectedFilters.agentId) > 0 ? Number(selectedFilters.agentId) : undefined,
        };

        // leadsModule.getTrackingLeads(params).then((res) => {
        //     setModuleData({ ...res.data, loading: false });
        // }).catch((err) => {
        //     setModuleData({ ...moduleData, loading: false });
        // });
    }, [selectedFilters, leadsModule]);

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

    const reloadTableData = useCallback((query?: Partial<PropertiesTrackingTypes>) => {
        // leadsModule.getTrackingLeads(query).then((res) => {
        //     setModuleData(res.data);
        // }).catch((err) => {
        //     setModuleData({ ...moduleData, loading: false });
        //     message.error(err?.response?.data?.message || "Something went wrong")
        // });
    }, [leadsModule]);

    useEffect(() => {
        setModuleData({ ...moduleData, loading: true });
        reloadTableData();
    }, []);

    const reloadTableDataWithFilters = useCallback(() => {
        const fromDateString: string = selectedFilters.dateRange?.[0] || "";
        const toDateString = selectedFilters.dateRange?.[1] || "";
        const fromDate = fromDateString ? convertDate(fromDateString, "yy-mm-dd") : undefined;
        const toDate = toDateString ? convertDate(toDateString, "yy-mm-dd") : undefined;

        reloadTableData({
            perPage: moduleData?.meta?.perPage || 10,
            page: moduleData?.meta?.page || 1,
            propertyId: Number(selectedFilters.propertyId) > 0 ? Number(selectedFilters.propertyId) : undefined,
            propertyUrl: selectedFilters.propertyUrl ? selectedFilters.propertyUrl : undefined,
            // source: selectedFilters.source ? selectedFilters.source : undefined,
            userAgent: selectedFilters.userAgent ? selectedFilters.userAgent : undefined,
            userIP: selectedFilters.userIP ? selectedFilters.userIP : undefined,
            fromDate: fromDate,
            toDate: toDate,
            organizationId: Number(selectedFilters.organizationId) > 0 ? Number(selectedFilters.organizationId) : undefined,
            propertyCategory: selectedFilters.propertyCategory ? selectedFilters.propertyCategory : undefined,
            agentId: Number(selectedFilters.agentId) > 0 ? Number(selectedFilters.agentId) : undefined,
        })
    }, [moduleData, selectedFilters])

    const moreFiltersOptions = [
        {
            label: "Organization",
            value: "organizationId",
        },
        {
            label: "Agent ID",
            value: "agentId",
        },
        {
            label: "Property URL",
            value: "propertyUrl",
        },
        {
            label: "Property Category",
            value: "propertyCategory",
        },
    ]

    const moreComponents: any = {
        organizationId: (
            <CustomFilter
                type="radio"
                label="Organization"
                name="organizationId"
                withSearch={true}
                options={organizationData?.data?.map((item) => ({
                    label: item.name,
                    value: `${item.id}`,
                })) || []}
                onChange={onSelected}
                value={Number(selectedFilters?.organizationId) > 0 ? String(selectedFilters?.organizationId) : ""}
                onReset={() => {
                    setReset(true)
                    onReset("organizationId", 0);
                    // reset the search term
                    setOrgSearchTerm("");
                }}
                onUpdate={onUpdate}
                // START: For search
                loading={organizationData?.loading}
                searchTerm={orgSearchTerm}
                onSearch={(event) => setOrgSearchTerm(event.currentTarget.value)}
            // END: For search
            />
        ),
        agentId: (
            <CustomFilter
                type="input"
                label="Agent ID"
                name="agentId"
                value={selectedFilters?.agentId === 0 ? "" : String(selectedFilters?.agentId)}
                onChange={onSelected}
                onReset={() => onReset("agentId", 0)}
                onUpdate={onUpdate}
            />
        ),
        propertyUrl: (
            <CustomFilter
                type="input"
                label="Property URL"
                name="propertyUrl"
                value={String(selectedFilters?.propertyUrl)}
                onChange={onSelected}
                onReset={() => onReset("propertyUrl", "")}
                onUpdate={onUpdate}
            />
        ),
        propertyCategory: (
            <CustomFilter
                type="radio"
                label="Property Category"
                name="propertyCategory"
                options={propertyCategories?.data?.map((item: PropertyCategoryType) => ({
                    label: item.localization[0].title,
                    value: item.slug
                }))}
                value={String(selectedFilters?.propertyCategory)}
                onChange={onSelected}
                onReset={() => onReset("propertyCategory", "")}
                onUpdate={onUpdate}
            />
        )
    }

    return (
        <SiteSettingsTemplate permissionSlug={permissionSlug}>
            <PageHeader
                heading="Leads Tracker"
                breadCrumbData={breadCrumbsData}
                filters={
                    <div className={styles.filterWrapper}>
                        <div>
                            <CustomFilter
                                type="radio"
                                label="Source"
                                name="source"
                                options={[]}
                                value={String(selectedFilters?.source)}
                                onChange={onSelected}
                                onReset={() => onReset("source", "")}
                                onUpdate={onUpdate}
                            />
                        </div>
                        <div>
                            <CustomFilter
                                type="input"
                                label="Property ID"
                                name="propertyId"
                                value={Number(selectedFilters?.propertyId) > 0 ? String(selectedFilters?.propertyId) : ""}
                                onChange={onSelected}
                                onReset={() => onReset("propertyId", 0)}
                                onUpdate={onUpdate}
                            />
                        </div>
                        <div>
                            <CustomFilter
                                type="input"
                                label="User Agent"
                                name="userAgent"
                                value={String(selectedFilters?.userAgent)}
                                onChange={onSelected}
                                onReset={() => onReset("userAgent", "")}
                                onUpdate={onUpdate}
                            />
                        </div>
                        <div>
                            <CustomFilter
                                type="input"
                                label="User IP"
                                name="userIP"
                                value={String(selectedFilters?.userIP)}
                                onChange={onSelected}
                                onReset={() => onReset("userIP", "")}
                                onUpdate={onUpdate}
                            />
                        </div>
                        <div>
                            <CustomFilter
                                type="datepicker"
                                label="Date"
                                name="dateRange"
                                onChange={(value) => {
                                    setSelectedFilters({
                                        ...selectedFilters,
                                        dateRange: value
                                    })
                                }}
                                onReset={() => onReset("dateRange", [])}
                                onUpdate={onUpdate}
                            />
                        </div>
                        {/**  Find the selected filter and render the component based on the name of the filter */
                            Object.keys(moreComponents).map((key: string) => {
                                return moreFilters?.includes(key) && moreComponents[key]
                            })
                        }
                        <div>
                            <MoreCustomFilters
                                options={moreFiltersOptions?.map((option) => ({
                                    label: option.label,
                                    value: option.value,
                                }))}
                                onChange={(value) => {
                                    setMoreFilters(value as any)
                                }}
                                value={moreFilters}
                            />
                        </div>
                    </div>
                }
            />

            {moduleData.loading ? (
                <Skeletons items={5} fullWidth />
            ) : (
                <>
                    <div className={styles.antdTableWrapper}>
                        <TableComponent
                            tableData={moduleData?.data}
                            tableLoading={moduleData?.loading!}
                            // emptyText={
                            // 	<Empty
                            // 		image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                            // 		imageStyle={{
                            // 			height: 200,
                            // 		}}
                            // 		description={
                            // 			<span>
                            // 				No credits usage history found
                            // 			</span>
                            // 		}
                            // 	>
                            // 	</Empty>
                            // }
                            reloadTableData={reloadTableDataWithFilters}
                            onEditIconClick={() => { }}
                        />
                    </div>
                    <Pagination
                        total={moduleData?.meta?.total!}
                        current={moduleData?.meta?.page!}
                        defaultPageSize={moduleData?.meta?.perPage ? moduleData?.meta?.perPage : 10}
                        pageSizeOptions={[10, 20, 50, 100]}
                        onChange={onPaginationChange}
                    />
                </>
            )}
        </SiteSettingsTemplate>
    );
};

export default LeadsTrackingSettings;
