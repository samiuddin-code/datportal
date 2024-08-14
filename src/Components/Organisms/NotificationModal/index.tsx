import { FC, useEffect, useMemo, useState } from "react";
import {
  Badge, Button, Card, Divider, Dropdown, Empty, message, Skeleton, Switch, Tooltip
} from "antd";
import { FileOutlined } from "@ant-design/icons";
import {
  BellFilled, CheckOutlined, CloseOutlined
} from "@ant-design/icons";
import Typography from "@atoms/Headings";
import { NotificationModule } from "@modules/Notification";
import { NotificationTypes } from "@modules/Notification/types";
import { convertDate } from "@helpers/dateHandler";
import { useConditionFetchData } from "hooks";
import styles from "./styles.module.scss";
import { APPLICATION_RESOURCE_BASE_URL, RESOURCE_BASE_URL } from "@helpers/constants";

interface NotificationModalProps {
  dropdown?: boolean;
  fetch?: boolean;
}

const NotificationModal: FC<NotificationModalProps> = ({ dropdown = true, fetch = false }) => {
  const module = useMemo(() => new NotificationModule(), [])
  const [firstClick, setFirstClick] = useState<boolean>(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState<boolean>(true);

  const condition = useMemo(() => {
    if (dropdown && firstClick) {
      return true
    } else if (!dropdown && fetch) {
      return true
    }
    return false
  }, [firstClick])

  const { data, loading, onRefresh } = useConditionFetchData<NotificationTypes[]>({
    method: module.getAllRecords,
    condition: condition,
    initialQuery: { showUnreadOnly },
  })

  const handleRead = (id: number) => {
    module.updateRecord(id).then((res) => {
      if (res.data && res.data?.data) {
        onRefresh()
      }
    })
  }

  const handleMarkAllAsRead = () => {
    module.readAllRecords().then((res) => {
      if (res.data && res.data?.data) {
        onRefresh()
        message.success('All notifications marked as read')
      }
    }).catch((err) => {
      const errorMessage = err?.response?.data?.message || 'Something went wrong'
      message.error(errorMessage)
    })
  }

  useEffect(() => {
    onRefresh({ showUnreadOnly })
  }, [showUnreadOnly])

  const overlay = (
    <Card className={dropdown ? styles.overlay : styles.overlay_page}>
      <div>
        <div className="d-flex justify-space-between">
          <Typography weight="bold" color="dark-main" size="normal">
            News & Updates
          </Typography>

          <div
            className="color-dark-sub ml-2 mr-auto cursor-pointer font-size-xs"
            onClick={handleMarkAllAsRead}
          >
            Mark All As Read
          </div>

          <div className="d-flex align-center">
            <p className="color-dark-sub mb-0 mx-2 font-size-xs">
              Show Unread
            </p>

            <Switch
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
              defaultChecked={showUnreadOnly}
              onChange={(checked) => setShowUnreadOnly(checked)}
              size="small"
              className="color-dark-sub"
            />
          </div>
        </div>

        <Divider className="my-2" />

        {loading ? (
          <Skeleton active />
        ) : (
          <>
            <div className="mb-3 mt-0">
              {data?.length === 0 ? (
                <Empty
                  image="/images/no-notification.svg"
                  imageStyle={{ height: 200 }}
                  description={<span>You have no new notifications.</span>}
                />
              ) : (
                <>
                  {data?.map((item, index: number) => (
                    <div
                      key={`notification-content${index}`}
                      className={styles.notificationContent}
                    >
                      <div className="d-flex align-center">
                        <div className={item.icon ? styles.notificationImage : styles.mailIcon}>
                          <img
                            src={item.icon ? `${RESOURCE_BASE_URL}${item.icon}` : '/images/mail.png'}
                            alt={'Notification'}
                          />
                        </div>

                        <div className="d-flex flex-column ml-2">
                          <a
                            className="color-dark-main font-size-normal"
                            href={item.link ? item.link : '#'}
                            onClick={() => handleRead(item.id)}
                            target={item.link ? '_blank' : '_self'}
                            rel="noreferrer"
                          >
                            {item.message} {(item.type !== "broadcast") && (
                              <Tooltip title="Broadcast">
                                <Badge dot />
                              </Tooltip>
                            )}
                          </a>

                          {item?.file && (
                            <Button
                              type="ghost" size="small" style={{
                                fontSize: '10px', borderRadius: 5, width: 100,
                                color: "var(--color-dark-sub)",
                              }}
                              href={`${APPLICATION_RESOURCE_BASE_URL}${item?.file}`}
                              target="_blank" rel="noreferrer"
                            >
                              View Attachment
                            </Button>
                          )}

                          <Typography color="dark-sub" size="xs" >
                            {convertDate(item.addedDate, 'dd M,yy-t')}
                          </Typography>
                        </div>
                      </div>

                      <CloseOutlined
                        className="color-red-yp"
                        onClick={() => handleRead(item.id)}
                      />
                    </div>
                  ))}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </Card>
  );

  return (
    <>
      {dropdown ? (
        <Dropdown dropdownRender={() => overlay} trigger={["click"]}>
          <BellFilled
            onClick={() => setFirstClick(true)}
          />
        </Dropdown>
      ) : overlay}
    </>
  );
}

export default NotificationModal;
