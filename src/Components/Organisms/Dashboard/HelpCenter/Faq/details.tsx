import { PageHeader } from '@ant-design/pro-components';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import BreadCrumbs from '../../../../Atoms/BreadCrumbs';
import { FAQDetailsType } from '@modules/FAQs/types';
import styles2 from './style.module.scss'

interface DetailsProps {
    breadCrumbData?: Array<{ isLink: boolean; text: string; path?: string }>;
    pageHeading?: string;
    faq?: FAQDetailsType
    drawerHelp?: boolean
}

const FAQDetailsComponent: FC<DetailsProps> = ({ breadCrumbData, pageHeading, faq, drawerHelp }) => {
    const navigate = useNavigate();

    return (
        <div>
            {!drawerHelp && (
                <>
                    <BreadCrumbs separator='>' data={breadCrumbData} />

                    <PageHeader
                        onBack={() => navigate('/help-center/' + faq?.FaqsCategory.slug)}
                        title={pageHeading}
                        className={'pa-0 py-2'}
                    />
                </>
            )}
             <div className={styles2.faqWrap}>
            <div
                className='mx-5 color-dark-sub dangerouslySetWrap faqsWrap'
                dangerouslySetInnerHTML={{ __html: faq?.description || "" }}
            ></div>
            </div>
        </div>
    );
}
export default FAQDetailsComponent;