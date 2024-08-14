import { FC, useCallback, useEffect, useState, useMemo } from 'react';
import { FAQCategoryModule } from '../../../../Modules/FAQCategory';
import { FAQCategoryTypes, FAQCategoryTypesResponseObject } from '../../../../Modules/FAQCategory/types';
import Layout from "../../../Templates/Layout";
import Skeletons from '../../Skeletons';
import Header from './header'
import { CategoryCard, ContactCard } from './Section';
import styles from './styles.module.scss'

interface HelpCenterProps { }

const HelpCenter: FC<HelpCenterProps> = () => {
    const faqCategoryModule = useMemo(() => new FAQCategoryModule(), [])
    const [faqCategory, setFaqCategory] = useState<Partial<FAQCategoryTypesResponseObject>>({
        loading: false,
        error: {},
        data: [],
    });

    const getFAQCategoryData = useCallback(() => {
        faqCategoryModule.getAllPublishedRecords().then((res) => {
            if (res.data && res.data?.data) {
                setFaqCategory({ ...res.data, loading: false })
            }
        })
    }, [faqCategoryModule])

    useEffect(() => {
        getFAQCategoryData()
    }, [getFAQCategoryData])
    
    return (
        <Layout>
            <div className={styles.helpCenterWrapper}>
                <Header />

                {faqCategory.loading ? <Skeletons items={8} /> : (
                    <div className={styles.category}>
                        {faqCategory?.data?.map((item: FAQCategoryTypes, index: number) => (
                            <CategoryCard
                                heading={item.title}
                                subCategory={item.ChildCategory}
                                key={`help-center-category${index}`}
                            />
                        ))}
                    </div>
                )}

                <div className='mt-10'>
                    <ContactCard />
                </div>
            </div>
        </Layout>
    );
}
export default HelpCenter;