import { type FC, Dispatch, SetStateAction, useState } from 'react';
import { Avatar, Image, Popconfirm } from 'antd';
import { UserOutlined, DeleteOutlined } from '@ant-design/icons';
import { ProjectConversationTypes, ProjectMember } from '@modules/Project/types';
import { PROTECTED_RESOURCE_BASE_URL, RESOURCE_BASE_URL } from '@helpers/constants';
import { UserPopover } from '@atoms/UserPopver';
import TokenService from '@services/tokenService';
import CustomPhotoView from '@atoms/PhotoView';
import moment from 'moment';
import styles from './styles.module.scss';

type SelectedFileTypes = {
  path: string
  open: boolean
}

interface ConversationCardsProps {
  data: ProjectConversationTypes
  setSelectedFile: Dispatch<SetStateAction<SelectedFileTypes>>
  onRemoveConversation: (conversationId: number) => void
  projectMembers: ProjectMember[]
}

const ConversationCards: FC<ConversationCardsProps> = (props) => {
  const { data, setSelectedFile, onRemoveConversation, projectMembers } = props;
  const currentUser = TokenService.getUserData();
  const access_token = TokenService.getLocalAccessToken();
  const isOwner = data?.User?.id === currentUser?.id;
  const isDateGreaterThan15Min = new Date(data?.addedDate).getTime() + 15 * 60 * 1000 < new Date().getTime();
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div
      className={`${styles.card_wrapper_container} ${isOwner ? styles.card_wrapper_owner : styles.card_wrapper}`}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      {(isOwner && showDelete && !isDateGreaterThan15Min) && (
        <Popconfirm
          title="Are you sure you want to delete this conversation?"
          okText="Yes" cancelText="No" placement='left'
          onConfirm={() => onRemoveConversation(data?.id)}
        >
          <DeleteOutlined style={{ color: "red" }} />
        </Popconfirm>
      )}
      <div className={`${styles.card}`}>
        <div className={styles.card_avatar}>
          {!isOwner && (
            <Avatar
              src={`${RESOURCE_BASE_URL}${data?.User?.profile}`}
              icon={<UserOutlined />}
              size={'default'}
            />
          )}
        </div>

        <div className={`${styles.card_content} ${isOwner ? styles.card_content_owner : styles.card_content_other}`}>
          <div className={`${styles.card_sender} ${isOwner ? styles.card_sender_owner : styles.card_sender_other}`}>

            {!isOwner && (
              <UserPopover user={data?.User} type='user'>
                <p className={styles.card_sender_name}>
                  {`${data?.User?.firstName} ${data?.User?.lastName}`}
                </p>
              </UserPopover>
            )}

            <span className={styles.card_sent_at} title={moment(data.addedDate).format("DD MMM, YYYY hh:mm A")}>
              {moment(data.addedDate).fromNow()}
            </span>
          </div>

          <div className={styles.card_message}>
            <div
              dangerouslySetInnerHTML={{
                __html: data?.message?.replace(/@(\w+\s*\w*)/g, (match, p1) => {
                  const name = p1.replace(/@|\(|\)/g, '');
                  // console.log('userId', name);
                  const user = projectMembers?.find((member) => `${member?.User?.firstName} ${member?.User?.lastName}`?.includes(name));
                  /**
                   *  <UserPopover user={user?.User} type='user'>
                   *   <span className={styles.card_message_mention}>
                   *    {match}{" "}
                   *  </span>
                   * </UserPopover> as any
                   *  */
                  if (user) {
                    return `<span class=${styles.card_message_mention}>${match}</span>`
                  } else {
                    return match;
                  }
                })
              }}
            />
            {/* {data?.message?.replace(/@(\w+\s*\w*)/g, (match, p1) => {
              const name = p1.replace(/@|\(|\)/g, '');
              // console.log('userId', name);
              const user = projectMembers?.find((member) => `${member?.User?.firstName} ${member?.User?.lastName}`?.includes(name));
              <UserPopover user={user?.User} type='user'>
                <span className={styles.card_message_mention}>
                  {match}{" "}
                </span>
              </UserPopover> as any

              if (user) {
                return `<span class=${styles.card_message_mention}>${match}</span>`
              } else {
                return match;
              }
            })} */}
          </div>

          {data?.Media?.length > 0 && (
            <div className={styles.conversation__files}>
              {data?.Media?.map((media, index) => (
                <div key={`media-${index}`} className={styles.conversation__files_item}>
                  {media.fileType?.includes("image") ? (
                    <CustomPhotoView
                      images={[`${PROTECTED_RESOURCE_BASE_URL}${media.path}?authKey=${access_token}`]}
                      width={300} height={150}
                      style={{ borderRadius: 5, objectFit: 'cover' }}
                    />
                  ) : (
                    <Image
                      src='/images/doc.png' alt={`Document-${index}`}
                      preview={false} width={300} height={150}
                      style={{ borderRadius: 5, objectFit: 'contain' }}
                      onClick={() => setSelectedFile({ path: media.path, open: true })}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default ConversationCards;