import { FC } from 'react';
import { Link } from 'react-router-dom';
import { ChildCategoryTypes } from '../../../../../Modules/FAQCategory/types';
import { HelpCenterItemIcon } from '../../../../Icons';
import styles from '../styles.module.scss'

interface CategoryCardProps {
    heading?: string;
    subCategory: ChildCategoryTypes[];
    drawerHelp?: boolean
}

const CategoryCard: FC<CategoryCardProps> = ({ heading, subCategory, drawerHelp }) => {

    return (
        <div className={styles.category_card}>
            {!drawerHelp && (
                <h3 className={`color-dark-main font-weight-bold ${styles.category_card_heading}`}>
                    {heading}
                </h3>
            )}

            <div>
                {subCategory?.map((item, index) => (
                    <Link
                        to={`/help-center/${item.slug}`}
                        title={item?.title}
                        key={`help-center-category-item${index}`}
                    >
                        <div className='d-flex'>
                            {item._count.Faqs > 0 ? (
                                <>
                                    <HelpCenterItemIcon />
                                    <h6 className='font-size-sm color-dark-sub ml-2'>
                                        {item?.title}
                                    </h6>
                                </>
                            ) : null}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
export default CategoryCard;