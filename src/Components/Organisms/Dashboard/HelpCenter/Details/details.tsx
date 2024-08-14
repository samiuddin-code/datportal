import { Collapse } from 'antd';
import { PageHeader } from '@ant-design/pro-components';
import { FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FAQCategoryTypes } from '../../../../../Modules/FAQCategory/types';
import BreadCrumbs from '../../../../Atoms/BreadCrumbs';
import {LinkOutlined} from '@ant-design/icons'

const { Panel } = Collapse;

interface DetailsProps {
    breadCrumbData?: Array<{ isLink: boolean; text: string; path?: string }>;
    pageHeading?: string;
    faqC?: FAQCategoryTypes
    drawerHelp?: boolean
}

const FAQDetails: FC<DetailsProps> = ({ breadCrumbData, pageHeading, faqC, drawerHelp }) => {
    const navigate = useNavigate();

    return (
        <div>
            {!drawerHelp && (
                <>
                    <BreadCrumbs separator='>' data={breadCrumbData} />

                    <PageHeader
                        onBack={() => navigate('/help-center')}
                        title={pageHeading}
                        className={'pa-0 py-2'}
                    />
                </>
            )}

            {/* <div
                className='mx-5 color-dark-sub dangerouslySetWrap faqsWrap'
                dangerouslySetInnerHTML={{ __html: faqC?.description || "" }}
            ></div> */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {faqC?.Faqs.map((faq, index) => (
                    <Link
                        style={{ border: '1px solid var(--color-light-50)', borderRadius: '0.25rem', padding: '0.5rem', color: 'var(--color-dark-main)' }}
                        to={`/help-center/${faqC.slug}/${faq.slug}`}
                        title={faq?.title}
                        key={`help-center-category-faq${index}`}
                    >
                        {faq.title}
                        <LinkOutlined style={{float: 'right'}} />
                    </Link>
                ))}
            </div>
        </div>
    );
}
export default FAQDetails;