import { FC } from 'react';
import { CustomButton } from '../../../../Atoms';
import styles from '../styles.module.scss'

interface ContactCardProps { }

const ContactCard: FC<ContactCardProps> = () => {
    return (
        <div className={`text-center ${styles.additionalAssistance}`}>
            <div className='mb-3'>
                <h4 className='color-dark-main font-weight-bold font-size-lg mb-0'>
                    Do you need additional assistance?
                </h4>
                <p className='color-dark-sub font-size-sm'>Our friendly support team is here to help.</p>
            </div>

            <a href={"mailto:info@yallahproperty.ae"}>
                <CustomButton type='primary'>
                    Contact Tech Support
                </CustomButton>
            </a>
        </div>
    );
}
export default ContactCard;