import { useMemo, type FC, useState } from 'react';
import {
  Avatar, Popconfirm, message, Input, Spin, Checkbox, Tag, Modal, Tabs, Skeleton, Switch
} from 'antd';
import { ProCard } from '@ant-design/pro-components';
import {
  DeleteOutlined, LoadingOutlined, UserOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { CustomEmpty, Typography } from '@atoms/';
import { SendIcon } from '@icons/';
import { RESOURCE_BASE_URL } from '@helpers/constants';
import { useSelector } from 'react-redux';
import { RootState } from 'Redux/store';
import { InvoicePermissionsEnum } from '@modules/Invoice/permissions';
import { InvoiceTypes } from '@modules/Invoice/types';
import { InvoiceModule } from '@modules/Invoice';
import styles from './styles.module.scss';
import { useConditionFetchData } from 'hooks';
import LogsTable from './logs-table';
import { handleError } from '@helpers/common';
import { EnquiryNotesType } from '@modules/Enquiry/types';

const { TextArea } = Input;

interface InvoiceNotesProps {
  open: boolean
  onCancel: () => void
  invoiceId: number
  onRefresh: <QueryType = any>(query?: QueryType) => void
  permissions: { [key in InvoicePermissionsEnum]: boolean };
}

type NotesStateType = {
  content: string;
  loading: boolean;
  isConcern: boolean
}

const InvoiceNotes: FC<InvoiceNotesProps> = (props) => {
  const { invoiceId, onRefresh, permissions, open, onCancel } = props;
  const { loggedInUserData } = useSelector((state: RootState) => state.usersReducer);
  const { updateInvoice, readInvoice } = permissions;

  const module = useMemo(() => new InvoiceModule(), []);

  const [activeTab, setActiveTab] = useState<"addNote" | "logs">("addNote");
  const [showDelete, setShowDelete] = useState<{ [key: number]: boolean }>({});
  const [notes, setNotes] = useState<NotesStateType>({
    content: '', loading: false, isConcern: false
  })
  const [concernResolved, setConcernResolved] = useState<{
    confirmLoading: boolean;
    visible: boolean;
  }>({
    confirmLoading: false,
    visible: false,
  });

  const logsCondition = useMemo(() => {
    return !!invoiceId && readInvoice === true && activeTab === "logs"
  }, [invoiceId, readInvoice, activeTab])

  // Fetch notes
  const {
    data: allNotes, onRefresh: onRefreshNotes, loading: notesLoading
  } = useConditionFetchData<EnquiryNotesType[]>({
    method: () => module.getNoteById(invoiceId),
    condition: !!invoiceId && readInvoice === true
  })

  // Fetch notes logs
  const {
    data: noteLogs, onRefresh: onRefreshNoteLogs, loading: logsLoading
  } = useConditionFetchData<InvoiceTypes[]>({
    method: () => module.getLogsById(invoiceId), condition: logsCondition
  })

  /**Function to add a note
   * @param {string} note note to be added
   */
  const onAddNote = (note: string, isConcern: boolean) => {
    if (!note) {
      message.error('Please enter a note');
      return;
    }
    if (!invoiceId) return;

    if (updateInvoice === true) {
      setNotes((prev) => ({ ...prev, loading: true }));
      module.addNote(invoiceId, { note, isConcern }).then((res) => {
        message.success(res?.data?.message || 'Note added successfully');
        setNotes({ content: '', loading: false, isConcern: false })
        onRefresh();
        onRefreshNotes();
      }).catch((err) => {
        message.error(err?.response?.data?.message || 'Something went wrong');
        setNotes((prev) => ({ ...prev, loading: false }));
      })
    } else {
      message.error('You do not have permission to add notes');
    }
  }

  /**Function to remove a note
   * @param {number} noteId id of the note to be deleted
   */
  const onRemoveNote = (noteId: number) => {
    if (updateInvoice === true) {
      module.removeNote(noteId).then((res) => {
        message.success(res?.data?.message || 'Note deleted successfully');
        onRefresh();
        onRefreshNotes();
      }).catch((err) => {
        message.error(err?.response?.data?.message || 'Something went wrong');
      })
    } else {
      message.error('You do not have permission to delete notes');
    }
  }

  return (
    <Modal
      title="Notes" open={open} onCancel={onCancel} width={700}
      footer={(activeTab === "addNote" && !notesLoading) ? (
        <>
          <Checkbox
            checked={notes.isConcern}
            onChange={(e) => setNotes((prev) => ({ ...prev, isConcern: e.target.checked }))}
          >
            Mark as a concern
          </Checkbox>
          <div className={styles.notes_form_input_wrapper}>
            <Avatar
              size={30} icon={<UserOutlined />}
              className={styles.notes_form_avatar}
              src={`${RESOURCE_BASE_URL}${loggedInUserData?.data?.profile}`}
              alt={`${loggedInUserData?.data?.firstName} ${loggedInUserData?.data?.lastName}`}
            />
            <TextArea
              placeholder="Add a note..."
              className={styles.notes_form_input}
              autoSize={{ minRows: 1, maxRows: 4 }}
              value={notes.content}
              onChange={(e) => setNotes((prev) => ({ ...prev, content: e.target.value }))}
            />

            {notes.loading ? (
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 20 }} spin />}
                className={styles.notes_form_send_loader}
              />
            ) : (
              <SendIcon
                width={30} height={30}
                className={styles.notes_form_send}
                onClick={() => onAddNote(notes.content, notes.isConcern)}
              />
            )}
          </div>
        </>
      ) : null}
    >
      {/* <Tabs
        type='card' defaultActiveKey="addNote"
        onChange={key => {
          setActiveTab(key as "addNote" | "logs")
          key === "logs" && onRefreshNoteLogs()
        }}
      > */}
        {/** Notes Tab */}
        {/* <Tabs.TabPane tab="Notes" key="addNote"> */}
          <ProCard
            headStyle={{ display: 'unset', padding: 0 }}
            bodyStyle={{ padding: 0 }}
            className={styles.notes}
          >
            <div className={styles.notes_wrapper}>
              {notesLoading && (
                <div className={styles.notes_loader}>
                  <Skeleton active />
                </div>
              )}

              {(allNotes?.length === 0 && !notesLoading) && (
                <div className={styles.notes_empty}>
                  <CustomEmpty description="No notes found" />
                </div>
              )}

              {allNotes?.map((note, index) => (
                <div
                  key={`note-${index}`} className={styles.note}
                  onMouseEnter={() => setShowDelete({ [note.id]: true })}
                  onMouseLeave={() => setShowDelete({})}
                >
                  <Avatar
                    size={40} icon={<UserOutlined />}
                    className={styles.note_user_avatar}
                    src={`${RESOURCE_BASE_URL}${note.AddedBy.profile}`}
                    alt={`${note.AddedBy.firstName} ${note.AddedBy.lastName}`}
                  />
                  <div className={styles.note_content_wrapper}>
                    <div className={styles.note_header}>
                      <Typography weight='bold' color='dark-main'>
                        {`${note.AddedBy.firstName} ${note.AddedBy.lastName}`}
                      </Typography>
                      <p
                        className={styles.note_header_date}
                        title={moment(note.addedDate).format("DD MMM, YYYY hh:mm A")}
                      >
                        {moment(note.addedDate).fromNow()}

                        {note.isConcern && (
                          <Tag color="warning" className="ml-2">
                            Concern
                          </Tag>
                        )}

                        {note.isResolved && (
                          <Tag color="green" className="ml-2">
                            Resolved
                          </Tag>
                        )}


                        {(note.isConcern && !note.isResolved) && (
                          <Popconfirm
                            title="Are you sure to mark this concern as resolved?"
                            okText="Yes" cancelText="No" placement='bottomRight'
                            open={concernResolved.visible}
                            onOpenChange={(open) => setConcernResolved((prev) => ({ ...prev, visible: open }))}
                            onCancel={() => setConcernResolved((prev) => ({ ...prev, visible: false }))}
                            okButtonProps={{ loading: concernResolved.confirmLoading }}
                            onConfirm={() => {
                              if (updateInvoice === true) {
                                module.markConcernAsResolved(note.id).then((res) => {
                                  message.success(res?.data?.message || 'Concern resolved successfully');
                                  onRefresh();
                                  onRefreshNotes();
                                  setConcernResolved((prev) => ({ ...prev, visible: false }));
                                }).catch((err) => {
                                  const errorMessage = handleError(err);
                                  message.error(errorMessage || 'Something went wrong');
                                })
                              } else {
                                message.error('You do not have permission to resolve concerns');
                              }
                            }}
                          >
                            <Checkbox
                              checked={false}
                              onChange={(e) => setConcernResolved((prev) => ({ ...prev, visible: e.target.checked }))}
                            >
                              Mark as resolved
                            </Checkbox>
                          </Popconfirm>
                        )}
                      </p>
                      {showDelete[note.id] && (
                        <Popconfirm
                          title="Are you sure to delete this note?"
                          onConfirm={() => onRemoveNote(note.id)}
                          okText="Yes" cancelText="No"
                          placement='left'
                        >
                          <DeleteOutlined className={styles.note_header_delete} />
                        </Popconfirm>
                      )}
                    </div>
                    <p className={styles.note_content}>
                      {note.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ProCard>
        {/* </Tabs.TabPane> */}

        {/** Logs Tab */}
        {/* <Tabs.TabPane tab="Logs" key="logs">
          <LogsTable data={noteLogs!} loading={logsLoading} />
        </Tabs.TabPane> */}
      {/* </Tabs> */}
    </Modal >
  );
}
export default InvoiceNotes;