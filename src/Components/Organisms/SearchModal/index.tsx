import { Dropdown, Card, message, Divider, Button, Empty } from "antd";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "../../../helpers/useDebounce";
import { PropertiesModule } from "../../../Modules/Properties";
import { PropertiesTypeResponseObject } from "../../../Modules/Properties/types";
import CustomInput from "../../Atoms/Input";
import Skeletons from "../Skeletons";
import { RecentViewedProperties } from "./recentView";
import styles from "./styles.module.scss";

function SearchModal() {
  const propertiesModule = useMemo(() => new PropertiesModule(), [])
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [searchResult, setSearchResult] = useState<Partial<PropertiesTypeResponseObject>>({
    loading: false,
    data: []
  });

  const onSearch = (event: FormEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value
    setSearchTerm(value);
  }

  const GetSearchResult = useCallback(() => {
    if (debouncedSearchTerm) {
      setSearchResult({ ...searchResult, loading: true })

      propertiesModule.getAllRecords({ title: debouncedSearchTerm }).then((res) => {
        setSearchResult({ ...res.data, loading: false })
      }).catch((error) => {
        message.error(error?.response?.data?.message)
        setSearchResult({ ...searchResult, loading: false })
      })
    }
  }, [debouncedSearchTerm])

  useEffect(() => {
    GetSearchResult()
  }, [GetSearchResult])

  const overlay = (
    <Card className={styles.overlay}>
      <div>
        {/* <Typography color="dark-sub" size="sm" className="mb-3">
          {t("search_sub_heading")}
        </Typography> */}

        {(debouncedSearchTerm && searchResult.loading) ? (
          <Skeletons items={5} fullWidth />
        ) : (debouncedSearchTerm && searchResult.data?.length > 0) ? (
          <div className={styles.searchResult}>
            <RecentViewedProperties
              data={searchResult?.data}
            />
          </div>
        ) : (
          <Empty
            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
            imageStyle={{
              height: 150,
            }}
            description={
              <span>
                No Results
                <br />
                Please search what you are looking for.
              </span>
            }
          />
        )}

        <Divider />
      </div>

      <div className={styles.overlay_footer}>
        {"Go to all: "}

        <div>
          <Button
            className={styles.overlay_footer_btn}
            onClick={() => navigate('/properties?type=allProperties')}
          >
            Properties
          </Button>
          <Button
            className={styles.overlay_footer_btn}
            onClick={() => navigate('/agents')}
          >
            Users
          </Button>
          <Button
            className={styles.overlay_footer_btn}
            onClick={() => navigate('/properties?type=allProperties')}
          >
            Filters
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <Dropdown dropdownRender={() => overlay} trigger={["click"]}>
      <CustomInput
        placeHolder={"Search"}
        icon={<img src="/images/searchIcon.svg" alt="Search Icon" />}
        size="sm"
        label=""
        value={searchTerm}
        onChange={onSearch}
        className={styles.searchInput}
      />
    </Dropdown>
  );
}

export default SearchModal;
