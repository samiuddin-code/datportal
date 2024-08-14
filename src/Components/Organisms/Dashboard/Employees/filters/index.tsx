import {
  Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState
} from "react";
import { useDebounce } from "@helpers/useDebounce";
import {
  MoreFiltersOptionsTypes, MoreFiltersTypes, SelectedFiltersTypes, SelectedMoreFiltersTypes
} from "./types";
import CustomInput from "@atoms/Input";
import { QueryType } from "@modules/Common/common.interface";
import { UserQueryTypes, UserStatus, UserTypes } from "@modules/User/types";
import CustomFilter from "@atoms/CustomFilter";
import MoreCustomFilters from "@atoms/CustomFilter/more";
import { getOptionsFromEnum } from "@helpers/options";
import { capitalize } from "@helpers/common";
import { DepartmentModule } from "@modules/Department";
import { OrganizationModule } from "@modules/Organization";
import { useFetchData } from "hooks";
import { DepartmentType } from "@modules/Department/types";
import { OrganizationType } from "@modules/Organization/types";
import { UserModule } from "@modules/User";
import { RoleTypes } from "@modules/Roles/types";
import { RolesModule } from "@modules/Roles";
import { useSearch } from "./hooks";

type FiltersProps = {
  selectedFilters: SelectedFiltersTypes;
  setSelectedFilters: Dispatch<SetStateAction<SelectedFiltersTypes>>;
  onUpdate: (query?: QueryType<UserQueryTypes>) => void;
};

const Filters = (props: FiltersProps) => {
  const { selectedFilters, setSelectedFilters, onUpdate } = props;

  // Name Search
  const [searchNameTerm, setSearchNameTerm] = useState(undefined);
  const debouncedNameTerm = useDebounce(searchNameTerm, 500);

  // Multiple Name Search
  const [searchMultiNameTerm, setSearchMultiNameTerm] = useState<string | undefined>(undefined);
  const debouncedMultiNameTerm = useDebounce(searchMultiNameTerm, 500);

  // Role Search
  const [searchRoleTerm, setSearchRoleTerm] = useState<string | undefined>(undefined);
  const debouncedRoleTerm = useDebounce(searchRoleTerm, 500);

  const [moreFilters, setMoreFilters] = useState<Partial<keyof MoreFiltersTypes>[]>([]);
  const [reset, setReset] = useState<boolean>(false);

  const userModule = useMemo(() => new UserModule(), []);
  const departmentModule = useMemo(() => new DepartmentModule(), []);
  const orgModule = useMemo(() => new OrganizationModule(), []);
  const rolesModule = useMemo(() => new RolesModule(), []);

  const { data: deparment } = useFetchData<DepartmentType[]>({
    method: departmentModule.getAllPublishedRecords,
  });

  const { data: orgData } = useFetchData<OrganizationType[]>({
    method: orgModule.findPublished,
  });

  // Usage example
  const { state: userState, search: searchUsers } = useSearch<UserTypes>(userModule.getAllRecords);
  const { state: roleState, search: searchRoles } = useSearch<RoleTypes>(rolesModule.getAllRecords);

  // const showResetAll = useMemo(() => {
  //   return Object.entries(selectedFilters).some(([key, value]) => {
  //     if (key === "dateRange" || key === "ids") {
  //       return Array.isArray(value) && value.length > 0;
  //     }
  //     return value !== undefined && value !== "";
  //   });
  // }, [selectedFilters]);

  const onSelected = (event: any) => {
    const { name, value } = event?.target as { name: keyof SelectedFiltersTypes, value: string | string[] };

    // set the selected value in the state
    setSelectedFilters((prev) => ({ ...prev, [name]: value }));
  };

  const onReset = useCallback((name: keyof SelectedFiltersTypes, value: number | string | string[]) => {
    if (name) {
      setReset(true);
      setSelectedFilters({ ...selectedFilters, [name]: value });
    }
  }, [selectedFilters]);

  const onNameSearch = useCallback(() => {
    if (debouncedNameTerm !== undefined) {
      onUpdate({ name: debouncedNameTerm });
    } else {
      onUpdate({ name: undefined });
    }
  }, [debouncedNameTerm]);

  // Use Effect to fetch Name Search data
  useEffect(() => {
    onNameSearch();
  }, [onNameSearch]);

  useEffect(() => {
    searchUsers({ name: debouncedMultiNameTerm });
  }, [debouncedMultiNameTerm, searchUsers]);

  useEffect(() => {
    searchRoles({ title: debouncedRoleTerm });
  }, [debouncedRoleTerm, searchRoles]);

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

  const moreFiltersOptions: MoreFiltersOptionsTypes[] = [
    { label: "Email", value: "email" },
    { label: "Phone", value: "phone" },
    { label: "Employees", value: "ids" },
    { label: "Roles", value: "roleIds" },
  ];

  const moreComponents: MoreFiltersTypes = {
    email: (
      <CustomFilter
        type="email"
        label="Email"
        name="email"
        value={selectedFilters?.email}
        onChange={onSelected}
        onReset={() => onReset("email", "")}
        onUpdate={onUpdate}
        defaultVisible={moreFilters.includes("email")}
      />
    ),
    phone: (
      <CustomFilter
        type="input"
        label="Phone"
        name="phone"
        value={selectedFilters?.phone}
        onChange={onSelected}
        onReset={() => onReset("phone", "")}
        onUpdate={onUpdate}
        defaultVisible={moreFilters.includes("phone")}
      />
    ),
    ids: (
      <CustomFilter
        type="multiSelect"
        label="Employees"
        name="ids"
        withSearch={true}
        options={userState?.data?.map((item) => ({
          label: `${item.firstName} ${item.lastName}`,
          value: `${item.id}`,
        }))}
        onChange={(value) => setSelectedFilters((prev) => ({ ...prev, ids: value }))}
        onReset={() => {
          setReset(true)
          onReset("ids", []);
          // Reset search term
          setSearchMultiNameTerm("")
        }}
        defaultVisible={moreFilters.includes("ids")}
        onUpdate={onUpdate}
        // START: For search
        loading={userState.loading}
        searchTerm={searchMultiNameTerm || ""}
        onSearch={(event) => setSearchMultiNameTerm(event.currentTarget.value)}
      // END: For search
      />
    ),
    roleIds: (
      <CustomFilter
        type="multiSelect"
        label="Roles"
        name="roleIds"
        withSearch={true}
        options={roleState?.data?.map((item) => ({
          label: `${item.title}`,
          value: `${item.id}`,
        }))}
        onChange={(value) => setSelectedFilters((prev) => ({ ...prev, roleIds: value }))}
        onReset={() => {
          setReset(true)
          onReset("roleIds", []);
          // Reset search term
          setSearchRoleTerm("")
        }}
        defaultVisible={moreFilters.includes("roleIds")}
        onUpdate={onUpdate}
        // START: For search
        loading={roleState.loading}
        searchTerm={searchRoleTerm || ""}
        onSearch={(event) => setSearchRoleTerm(event.currentTarget.value)}
      // END: For search
      />
    ),
  };

  return (
    <div className={`mt-5 align-center`}>
      <div>
        <CustomInput
          value={searchNameTerm}
          onChange={(e: any) => setSearchNameTerm(e.target.value)}
          size="w100" placeHolder={"Search by Name"}
          icon={<img src="/images/searchIcon.svg" alt="" />}
        />
      </div>

      <div>
        <CustomFilter
          type="radio"
          label="Organization"
          name="organizationId"
          options={orgData?.map((option) => ({
            label: option.name,
            value: String(option.id),
          })) || []}
          value={String(selectedFilters?.organizationId)}
          onChange={onSelected}
          onReset={() => onReset("organizationId", "")}
          onUpdate={onUpdate}
        />
      </div>

      <div>
        <CustomFilter
          type="radio"
          label="Department"
          name="departmentId"
          options={deparment?.map((option) => ({
            label: option.title,
            value: String(option.id),
          })) || []}
          value={String(selectedFilters?.departmentId)}
          onChange={onSelected}
          onReset={() => onReset("departmentId", "")}
          onUpdate={onUpdate}
        />
      </div>

      <div>
        <CustomFilter
          type="radio"
          label="Status"
          name="status"
          options={getOptionsFromEnum(UserStatus).map((option) => ({
            label: capitalize(option.label),
            value: String(option.value),
          }))}
          value={String(selectedFilters?.status)}
          onChange={onSelected}
          onReset={() => onReset("status", "")}
          onUpdate={onUpdate}
        />
      </div>
      <div>
        <CustomFilter
          type="datepicker"
          label="Registered Date"
          name="dateRange"
          onChange={(value) => setSelectedFilters((prev) => ({ ...prev, dateRange: value }))}
          onReset={() => onReset("dateRange", [])}
          onUpdate={onUpdate}
        />
      </div>
      {/**  Find the selected filter and render the component based on the name of the filter */
        Object.keys(moreComponents).map((key) => {
          const _key = key as keyof MoreFiltersTypes;
          return moreFilters?.includes(_key) ? moreComponents[_key] : null
        })
      }
      <div>
        <MoreCustomFilters
          options={moreFiltersOptions?.map((option) => ({
            label: option.label,
            value: option.value,
          }))}
          onChange={(value) => setMoreFilters(value as SelectedMoreFiltersTypes)}
          value={moreFilters}
        />
      </div>
      {/* {showResetAll && (
        <p
          onClick={() => {
            Object.entries(selectedFilters).map(([key, value]) => {
              Array.isArray(value) ? onReset(key as keyof SelectedFiltersTypes, []) : onReset(key as keyof SelectedFiltersTypes, "");
            })

            // Reset search term
            setSearchNameTerm(undefined)
            setSearchMultiNameTerm(undefined)

            // Reset more filters
            setMoreFilters([])

            // Reset users
            setUsers({ data: [], loading: false })

            // Reset the table data
            onUpdate();
          }}
          style={{
            cursor: "pointer",
            color: "red",
            marginBottom: "0",
          }}
        >
          Reset All
        </p>
      )} */}
    </div>
  );
};

export default Filters;
