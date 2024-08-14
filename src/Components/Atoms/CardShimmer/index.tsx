import { Skeleton } from "antd"
import styles from './styles.module.scss'

export const CardShimmer = () => {
  return (
    <div className={styles.card}>
      <Skeleton active />
    </div>
  )
}