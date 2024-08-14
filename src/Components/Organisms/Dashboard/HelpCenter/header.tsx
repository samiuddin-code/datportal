import { FormEvent, FC, useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, Dropdown, message, Empty } from 'antd';
import { CustomInput } from '../../../Atoms';
import { useDebounce } from '../../../../helpers/useDebounce';
import { FAQModule } from '../../../../Modules/FAQs';
import { FAQTypes, FAQTypesResponseObject } from '../../../../Modules/FAQs/types';
import Skeletons from '../../Skeletons';
import styles from './styles.module.scss'

interface HeaderProps { }

const Header: FC<HeaderProps> = () => {
    const faqsModule = useMemo(() => new FAQModule(), [])

    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [searchResult, setSearchResult] = useState<Partial<FAQTypesResponseObject>>({
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

            faqsModule.getAllPublishedRecords({ title: debouncedSearchTerm }).then((res) => {
                setSearchResult({ ...res.data, loading: false })
            }).catch((error) => {
                message.error(error?.response?.data?.message)
                setSearchResult({ ...searchResult, loading: false })
            })
        }
    }, [debouncedSearchTerm, faqsModule])

    useEffect(() => {
        GetSearchResult()
    }, [GetSearchResult])

    // search overlay
    const overlay = (
        <Card className={styles.overlay + 'pa-5'}>
            {(debouncedSearchTerm && searchResult.loading) ? (
                <Skeletons items={2} fullWidth />
            ) : (debouncedSearchTerm && searchResult.data?.length > 0) ? (
                <div className={styles.searchResult}>
                    {searchResult.data?.map((item: FAQTypes) => (
                        <div key={`faqs-search-result-${item.id}`}>
                                <div style={{paddingLeft: 12}} key={item.title}>
                                    <Link to={`/help-center/${item.slug}#${item?.slug}`} title={item.title}>
                                        <p>{item.title}sad</p>
                                    </Link>
                                </div>
                        </div>
                    ))}
                </div>
            ) : (
                <Empty className='py-2' description={
                    <span>
                        No Results
                        <br />
                        Please search what you are looking for.
                    </span>
                } />
            )}
        </Card>
    );

    return (
        <div className={styles.header}>
            <h1 className='color-dark-main font-weight-bold mb-0'>
                Help Center
            </h1>
            <p className='color-dark-main font-weight-bold font-size-sm'>
                Search our knowledge base or browse categories below.
            </p>

            <Dropdown dropdownRender={() => overlay} trigger={["click"]}>
                <CustomInput
                    placeHolder='Search our help center articles'
                    icon={<img src="/images/searchIcon.svg" alt="Search Icon" />}
                    size="w100"
                    className='py-2'
                    value={searchTerm}
                    onChange={onSearch}
                />
            </Dropdown>
        </div>
    );
}
export default Header;