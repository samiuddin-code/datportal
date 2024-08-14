import type { FC } from 'react';
import { Table, Typography as AntdTypography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { convertDate } from '@helpers/dateHandler';
import { Typography } from '@atoms/';
import { CalenderIcon } from '@icons/';
import { EnquiryType } from '@modules/Enquiry/types';
import { EnquirySource } from '@helpers/commonEnums';

const { Paragraph } = AntdTypography;

interface LogsTableProps {
  data: Partial<EnquiryType[]>
  loading: boolean
}

const LogsTable: FC<LogsTableProps> = ({ data, loading }) => {
  const columns: ColumnsType<any> = [
    {
      title: "S.No",
      dataIndex: "index",
      key: "index",
      render: (_text: string, _record: {}, index: number) => index + 1,
      width: "60px",
    },
    {
      title: 'User',
      dataIndex: "user",
      key: "user",
      render: (_user: string, record: EnquiryType) => (
        <div className="d-flex">
          <div className="my-auto">
            <Typography color="dark-main" size="sm">
              {`${record.name}`}
            </Typography>

            {record?.email && (
              <Paragraph
                title={record.email}
                ellipsis={{ rows: 1, expandable: false }}
                copyable={{ text: record.email }}
                className="font-size-xs color-dark-sub mb-0 mt-1"
              >
                Email:  {record.email}
              </Paragraph>
            )}

            {record?.phone && (
              <Paragraph
                title={`+${record.phoneCode}${record.phone}`}
                ellipsis={{ rows: 1, expandable: false }}
                copyable={{ text: `+${record.phoneCode}${record.phone}` }}
                className="font-size-xs color-dark-sub mb-0 mt-1"
              >
                Phone:   {`+${record.phoneCode}${record.phone}`}
              </Paragraph>
            )}

            {record?.slug && (
              <Paragraph
                title={record.slug}
                ellipsis={{ rows: 1, expandable: false }}
                copyable={{ text: record.slug }}
                className="font-size-xs color-dark-sub mb-0 mt-1"
              >
                Slug:  {record.slug}
              </Paragraph>
            )}

            {record?.source && (
              <Typography color="dark-sub" size="xs">
                {`Source: ${EnquirySource[record.source]}`}
              </Typography>
            )}

            <div className="d-flex mt-4">
              <CalenderIcon className="mr-2" />
              <Typography color="dark-sub" size="sm">
                {`${convertDate(record.addedDate, "dd MM yy")}`}
              </Typography>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Message',
      dataIndex: "message",
      key: "message",
      render: (message: string) => (
        <Typography color="dark-main" size="sm">
          {message}
        </Typography>
      ),
      width: "20%",
    },
    {
      title: 'Note',
      dataIndex: 'LeadEnquiryFollowUp',
      key: 'LeadEnquiryFollowUp',
      render: (note: EnquiryType['LeadEnquiryFollowUp']) => (
        <>
          {note?.map((item) => (
            <Paragraph
              ellipsis={{ rows: 3, expandable: true }}
              className="font-size-xs color-dark-sub mb-0 mt-1"
            >
              {item.note}
            </Paragraph>
          ))}
        </>
      )
    },
  ];

  return <Table dataSource={data} columns={columns} loading={loading} />;
}
export default LogsTable;