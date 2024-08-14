import { FC, FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Drawer, Dropdown, Empty, message, Divider } from 'antd';
import { QuestionCircleFilled, LinkOutlined } from "@ant-design/icons";
import { useDebounce } from '../../../helpers/useDebounce';
import { FAQModule } from '../../../Modules/FAQs';
import { FAQTypes, FAQTypesResponseObject } from '../../../Modules/FAQs/types';
import Skeletons from '../Skeletons';
import styles from "./styles.module.scss";
import { CustomInput, Typography } from '../../Atoms';
import { FAQCategoryModule } from '../../../Modules/FAQCategory';
import { FAQCategoryTypes, FAQCategoryTypesResponseObject } from '../../../Modules/FAQCategory/types';
import { CategoryCard } from '../Dashboard/HelpCenter/Section';
import FAQDetails from '../Dashboard/HelpCenter/Details/details';
import { log } from 'console';

interface HelpDrawerProps { }

const HelpDrawer: FC<HelpDrawerProps> = () => {
    const [open, setOpen] = useState(false);
    const [firstTime, setfirstTime] = useState<boolean>(false);

    const showDrawer = () => {
        setOpen(true);
        setfirstTime(true);
    }

    const onClose = () => setOpen(false);

    const faqsModule = useMemo(() => new FAQModule(), [])
    const faqCategoryModule = useMemo(() => new FAQCategoryModule(), [])

    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    // Search result data
    const [searchResult, setSearchResult] = useState<Partial<FAQTypesResponseObject>>({
        loading: false,
        data: []
    });
    // FAQ Category data
    const [faqCategory, setFaqCategory] = useState<Partial<FAQCategoryTypesResponseObject>>({
        loading: true,
        error: {},
        data: [],
    });
    // FAQS data
    const [faqsData, setfaqsData] = useState<Partial<FAQTypesResponseObject>>({
        loading: true,
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
        <Card className={styles.overlay}>
            {(debouncedSearchTerm && searchResult.loading) ? (
                <Skeletons items={2} fullWidth />
            ) : (debouncedSearchTerm && searchResult.data?.length > 0) ? (
                <div className={styles.searchResult}>
                    {searchResult.data?.map((item: FAQTypes) => (
                        <div className='px-1' key={`faqs-search-result-${item.id}`}>
                            <div >
                                <Link
                                    to={`/help-center/${item?.slug}`}
                                    title={item?.title}
                                >
                                    <p>{item.title}</p>
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



    const getFAQCategoryData = useCallback(() => {
        if (!firstTime) return
        faqCategoryModule.getAllPublishedRecords().then((res) => {
            console.log(res, 'axda')
            if (res.data && res.data?.data) {
                setFaqCategory({ ...res.data, loading: false })
            }
        })
    }, [faqCategoryModule, firstTime])

    useEffect(() => {
        getFAQCategoryData()
    }, [getFAQCategoryData])

    const getFAQsData = useCallback(() => {
        if (!firstTime) return
        faqsModule.getAllPublishedRecords({ perPage: 5 }).then((res) => {
            if (res.data && res.data?.data) {
                setfaqsData({ ...res.data, loading: false })
            }
        })
    }, [faqsModule, firstTime])

    useEffect(() => {
        getFAQsData()
    }, [getFAQsData])
    return (
        <>
            <QuestionCircleFilled onClick={showDrawer} />

            <Drawer
                title="Help"
                placement="right"
                onClose={onClose}
                open={open}
                headerStyle={{ backgroundColor: '#f2f2f2' }}
            >
                <div className={styles.header}>
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

                <div className='mx-6'>
                    <Typography color='dark-main' size='normal' weight='bold' className='mt-5'>
                        Quick Links
                    </Typography>

                    <Divider className='my-2' />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                        {faqsData.data.map((faq: FAQTypes, index: number) => (
                            <a
                                style={{ color: 'var(--color-dark-main)', fontSize: 'var(--font-size-sm)', fontWeight: '500' }}
                                href={`/help-center/${faq?.FaqsCategory?.slug}/${faq?.slug}`}
                                title={faq?.title}
                                key={`help-center-category-faq${index}`}
                            >
                                {faq.title}
                                <LinkOutlined style={{ float: 'right' }} />
                            </a>
                        ))}
                    </div>
                    {/* <FAQDetails faqC={faqsData?.data} drawerHelp /> */}
                </div>

                <div className='mx-6'>
                    <Typography color='dark-main' size='normal' weight='bold' className='mt-5'>
                        More Articles
                    </Typography>

                    <Divider className='my-2' />

                    {faqCategory.loading ? <Skeletons items={8} fullWidth /> : (
                        <div className='mt-3'>
                            {faqCategory?.data?.map((item: FAQCategoryTypes, index: number) => (
                                <CategoryCard
                                    subCategory={item.ChildCategory}
                                    key={`drawer-help-center-category${index}`}
                                    drawerHelp
                                />
                            ))}
                        </div>
                    )}
                </div>
            </Drawer>
        </>
    );
}

export default HelpDrawer;