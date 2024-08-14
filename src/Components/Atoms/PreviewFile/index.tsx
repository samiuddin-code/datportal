import type { FC } from 'react';
import { Spin } from 'antd';
import CustomEmpty from '@atoms/CustomEmpty';
import TokenService from '@services/tokenService';
import { PROTECTED_RESOURCE_BASE_URL } from '@helpers/constants';

interface PreviewFileProps {
  file: string;
  tip?: string;
  loading?: boolean;
}

/** Preview File */
const PreviewFile: FC<PreviewFileProps> = ({ file, loading, tip }) => {
  const access_token = TokenService.getLocalAccessToken();

  return (
    <div style={{ overflow: "hidden", height: "100%" }}>
      {!loading ? (
        <>
          {file ? (
            <iframe
              src={`${PROTECTED_RESOURCE_BASE_URL}${file}?authKey=${access_token}`}
              style={{ width: "100%", height: "100%" }}
              title='Preview File'
            />
          ) : (
            <div className='w-100 h-100 d-flex justify-center align-center font-size-lg'>
              <CustomEmpty description={"No PDF found"} />
            </div>
          )}
        </>
      ) : (
        <Spin
          size="large" style={{ gap: "1rem" }}
          className='w-100 h-100 d-flex justify-center align-center font-size-lg'
          tip={tip || "Please wait while we are preparing the file..."}
        />
      )}
    </div>
  );
}
export default PreviewFile;