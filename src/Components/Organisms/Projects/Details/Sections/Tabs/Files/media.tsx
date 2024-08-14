import { useMemo, type FC, useState } from 'react';
import { Tooltip, Image, Drawer, Typography, Checkbox } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { CustomPhotoView, Pagination } from '@atoms/';
import { ProjectResourceQueryTypes, ProjectResourceTypes } from '@modules/Project/types';
import { PROTECTED_RESOURCE_BASE_URL } from '@helpers/constants';
import { FileVisibilityEnum } from '@helpers/commonEnums';
import TokenService from '@services/tokenService';
import styles from './styles.module.scss';
import PreviewFile from '@atoms/PreviewFile';
import { convertDate } from '@helpers/dateHandler';
import { QueryType } from '@modules/Common/common.interface';

const { Paragraph } = Typography;

interface MediaCardProps {
  data: ProjectResourceTypes[]
  onRefresh: <QueryType = any>(query?: QueryType) => void
  meta: QueryType
  projectId: number
  fromChat?: boolean
}

type SelectedFileTypes = {
  path: string
  open: boolean
}

const MediaCard: FC<MediaCardProps> = (props) => {
  const { data, meta, onRefresh, projectId, fromChat = false } = props;
  const access_token = TokenService.getLocalAccessToken();

  const [selectedFile, setSelectedFile] = useState<SelectedFileTypes>({
    path: '', open: false
  })

  const imageFiles = useMemo(() => {
    // save the images in an array
    let images: ProjectResourceTypes[] = [];
    // loop through the data array
    data?.forEach((item) => {
      // if the file type is an image
      if (item.fileType?.includes('image')) {
        // don't add duplicates
        if (!images.includes(item)) {
          images.push(item);
        }
      }
    });
    // if it is from chat, splice the array to show only 4 images
    if (fromChat) {
      images.splice(4);
    }
    return images;
  }, [data]);

  const otherFiles = useMemo(() => {
    // save the other files in an array
    let files: ProjectResourceTypes[] = [];
    // loop through the data array
    data?.forEach((item) => {
      // if the file type is not an image
      if (!item.fileType?.includes('image')) {
        // don't add duplicates
        if (!files?.includes(item)) {
          files.push(item);
        }
      }
    });
    // if it is from chat, splice the array to show only 2 files
    if (fromChat) {
      files.splice(2);
    }
    return files;
  }, [data]);

  return (
    <>
      <div className={styles.media}>
        <div className={styles.media_photos}>
          <CustomPhotoView
            images={imageFiles.map((item) => `${PROTECTED_RESOURCE_BASE_URL}${item.path}?authKey=${access_token}`)}
            style={{ borderRadius: 5, objectFit: 'cover' }}
            width={115} height={100} className={styles.media_photo}
            overlayVisible
            overlay={(photoIndex) => {
              const item = imageFiles[photoIndex];
              return (
                <div>
                  <p className='mb-0 font-weight-bold'>{item?.title || "Untitled"}</p>

                  <p className='mb-0'>{convertDate(item?.addedDate!, "dd M,yy")}</p>
                </div>
              )
            }}
            extra={(value) => {
              // get the file from the data array using the index from the key
              const item = imageFiles?.find((_item, index) => index === Number(value?.key?.split('-')[1]));
              return (
                <div>
                  {item?.visibility === FileVisibilityEnum.public && (
                    <Tooltip title="This file is visible to all users">
                      <div className={styles.media_visibility} />
                    </Tooltip>
                  )}
                  <div className={styles.media_details}>
                    <Paragraph
                      className='mb-0 font-weight-bold px-1'
                      strong style={{ width: 115 }}
                      ellipsis={{ rows: 1, expandable: false }}
                    >
                      {item?.title || "Untitled"}
                    </Paragraph>

                    <p className='mb-0 px-1'>
                      {convertDate(item?.addedDate!, "dd M,yy")}
                    </p>
                  </div>
                </div>
              )
            }}
          />

          {otherFiles.map((item, idx) => {
            return (
              <div
                key={`${item}-${idx}`} className={styles.media_document}
                onClick={() => setSelectedFile({ path: item.path, open: true })}
              >
                <Image
                  src='/images/doc.png' alt={`Document-${idx}`}
                  width={115} height={55} preview={false}
                  style={{ objectFit: 'contain', marginTop: 10 }}
                />
                <div className={styles.media_document_details}>
                  <Paragraph
                    className='mb-0 font-weight-bold px-1'
                    strong style={{ width: 115 }}
                    ellipsis={{ rows: 1, expandable: false }}
                  >
                    {item?.title || "Untitled"}
                  </Paragraph>

                  <p className='mb-0 px-1'>
                    {convertDate(item?.addedDate!, "dd M,yy")}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {(meta?.pageCount! > 1 && !fromChat) && (
        <Pagination
          total={meta?.total!}
          current={meta?.page!}
          defaultPageSize={meta?.perPage! || 12}
          pageSizeOptions={[10, 20, 50, 100]}
          onChange={(page, pageSize) => {
            const params = {
              projectId: projectId,
              page: page,
              perPage: pageSize
            }
            onRefresh<Partial<ProjectResourceQueryTypes>>(params)
          }}
        />
      )}

      {selectedFile.open && (
        <Drawer
          open={selectedFile.open}
          onClose={() => setSelectedFile({ path: '', open: false })}
          width={window.innerWidth > 700 ? 700 : "100%"}
          title="Preview File" placement="right"
        >
          <PreviewFile file={selectedFile.path} />
        </Drawer>
      )}
    </>
  );
}
export default MediaCard;