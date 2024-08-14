import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import Layout from '../../../../Templates/Layout';
import FAQDetails from './details';
import styles from '../styles.module.scss'
import Skeletons from '../../../Skeletons';
import { FAQModule } from '@modules/FAQs';
import { FAQDetailsType, FAQTypesResponseObject } from '@modules/FAQs/types';
import { FAQCategoryModule } from '@modules/FAQCategory';
import { FAQCategoryTypes } from '@modules/FAQCategory/types';


interface DetailsPageProps { }

const HelpCenter: FC<DetailsPageProps> = () => {
    //get the slug from the path name
    const slug = window.location.pathname.split('/')[2];

    const module = useMemo(() => new FAQCategoryModule(), [])
    const [faq, setFaq] = useState<{
        loading: boolean,
        error: any,
        data?: FAQCategoryTypes
    }>({
        loading: true,
        error: {},
        data: undefined,
    });
    const [pageHeader, setPageHeader] = useState<string>('');

    const getFAQDetailsData = useCallback(() => {
        if (slug) {
            module.getRecordBySlug(slug).then((res) => {
                if (res.data && res.data?.data) {
                    setFaq({ ...res.data, loading: false })
                    setPageHeader(res.data?.data?.title)
                }
            }).catch((err) => {
                console.error('Error getting faq details data', err?.message)
            })
        }
    }, [module, slug])

    useEffect(() => {
        getFAQDetailsData()
    }, [getFAQDetailsData])
    
    const breadCrumbData = [
        { isLink: true, text: 'Home', path: '/' },
        { isLink: true, text: 'Help Center', path: '/help-center' },
        { isLink: false, text: pageHeader },
    ]

    return (
        <Layout>
            <div className={styles.helpCenterWrapper}>
                {faq.loading ? (
                    <Skeletons items={10} />
                ) : (
                    <FAQDetails pageHeading={pageHeader} breadCrumbData={breadCrumbData} faqC={faq?.data} />
                )}
            </div>
        </Layout>
    );
}
export default HelpCenter;