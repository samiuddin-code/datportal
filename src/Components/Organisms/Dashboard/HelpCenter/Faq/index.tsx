import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import Layout from '../../../../Templates/Layout';
import FAQDetailsComponent from './details';
import styles from '../styles.module.scss'
import Skeletons from '../../../Skeletons';
import { FAQModule } from '@modules/FAQs';
import { FAQDetailsType } from '@modules/FAQs/types';


interface DetailsPageProps { }

const FAQDetails: FC<DetailsPageProps> = () => {
    //get the slug from the path name
    const slug = window.location.pathname.split('/')[3];

    const module = useMemo(() => new FAQModule(), [])
    const [faq, setFaq] = useState<{
        loading: boolean,
        error: any,
        data?: FAQDetailsType
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
        { isLink: true, text: faq.data?.FaqsCategory.title || "", path: "/help-center/" + faq.data?.FaqsCategory.slug },
        { isLink: false, text: pageHeader },
    ]

    return (
        <Layout>
            <div className={styles.helpCenterWrapper}>
                {faq.loading ? (
                    <Skeletons items={10} />
                ) : (
                    <FAQDetailsComponent pageHeading={pageHeader} breadCrumbData={breadCrumbData} faq={faq?.data} />
                )}
            </div>
        </Layout>
    );
}
export default FAQDetails;