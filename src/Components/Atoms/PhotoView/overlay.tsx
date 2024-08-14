import type { FC } from 'react';
import styles from './styles.module.scss';

interface PhotoOverlayProps {
  children: React.ReactNode
}

const PhotoOverlay: FC<PhotoOverlayProps> = ({ children }) => {
  return (
    <div className={styles.overlay}>{children}</div>
  );
};

export default PhotoOverlay;