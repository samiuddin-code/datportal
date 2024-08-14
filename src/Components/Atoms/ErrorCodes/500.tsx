import type { FC } from 'react';
import { Illustation500 } from '../../Illustrations';
import CustomButton from '../Button';
import styles from './styles.module.scss';

interface ErrorCode500Props {
    mainMessage: string;
    subMessage?: string;
}

const ErrorCode500: FC<ErrorCode500Props> = ({ mainMessage, subMessage }) => {
    return (
        <div className={styles.errorCode}>
            <Illustation500 />

            <div>
                <h5 className={styles.errorCode_mainMessage}>{mainMessage}</h5>

                <p className={styles.errorCode_subMessage}>{subMessage}</p>

                <div className={styles.errorCodeBtns}>
                    <CustomButton
                        type='primary'
                        onClick={() => window.location.href = '/'}
                    >
                        Go to Home
                    </CustomButton>

                    <CustomButton
                        type='primary'
                        onClick={() => window.history.back()}
                    >
                        Previous Page
                    </CustomButton>
                </div>
            </div>
        </div>
    );
}
export default ErrorCode500;