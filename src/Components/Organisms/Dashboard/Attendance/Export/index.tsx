import { Modal, DatePicker, Button, message, Form } from 'antd';
import {
  type FC, Dispatch, SetStateAction, useState, useCallback, useMemo, useEffect
} from 'react';
import moment from 'moment';
import style from './styles.module.scss';
import CustomSelect from '@atoms/Select';
import { getOptionsFromEnum } from '@helpers/options';
import { AttendanceReportType, ReportType } from '@modules/Attendance/types';
import { AttendanceModule } from '@modules/Attendance';
import { capitalize, handleError } from '@helpers/common';
import { SelectWithSearch } from '@atoms/index';
import { UserModule } from '@modules/User';
import { DepartmentModule } from '@modules/Department';
import { OrganizationModule } from '@modules/Organization';
import { UserTypes } from '@modules/User/types';
import { DepartmentType } from '@modules/Department/types';
import { OrganizationType } from '@modules/Organization/types';
import { useDebounce } from '@helpers/useDebounce';

const { RangePicker } = DatePicker;

const datePresets = [
  {
    text: 'This Month',
    value: [moment().startOf('month'), moment().endOf('month')],
  },
  {
    text: 'Last Month',
    value: [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
  }
];

interface AttendanceExportProps {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}

type DataStateType<T> = {
  loading: boolean;
  data: T[];
}


const AttendanceExport: FC<AttendanceExportProps> = (props) => {
  const { isModalOpen, setIsModalOpen } = props;
  const [form] = Form.useForm();

  const [reportType, setReportType] = useState<keyof typeof ReportType>("all")
  const [dateOpen, setDateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const module = useMemo(() => new AttendanceModule(), []);
  const usersModule = useMemo(() => new UserModule(), []);
  const departmentModule = useMemo(() => new DepartmentModule(), []);
  const organizationModule = useMemo(() => new OrganizationModule(), []);

  const [usersTerm, setUserTerms] = useState("");
  const [users, setUsers] = useState<DataStateType<UserTypes>>({
    loading: false, data: []
  });
  const debouncedUsersTerm = useDebounce(usersTerm, 500);

  const [departments, setDepartments] = useState<DataStateType<DepartmentType>>({
    loading: false, data: []
  });

  const [organizations, setOrganizations] = useState<DataStateType<OrganizationType>>({
    loading: false, data: []
  });

  const onSubmit = async (values: AttendanceReportType & { date_range: [moment.Moment, moment.Moment] }) => {
    const { date_range, ...rest } = values;
    try {
      let params = {
        ...rest,
        fromDate: new Date(date_range?.[0].toISOString() || ""),
        toDate: new Date(date_range?.[1].toISOString() || ""),
      }
      setIsLoading(true);

      const response = await module.generateReport(params);
      const disposition = response.headers['content-disposition'];
      const matches = /filename=(?<filename>.*)/.exec(disposition);
      const filename = matches && matches.groups && matches.groups.filename ? matches.groups.filename : 'downloaded_file.xlsx';
      message.success("Report downloaded successfully");
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const errorMessage = handleError(error);
      message.error(errorMessage || "Something went wrong while downloading the file");
    } finally {
      setIsLoading(false);
    }
  }

  const GetUsers = (name: string) => {
    setUsers((prev) => ({ ...prev, loading: true }));
    const { getAllRecords } = usersModule

    getAllRecords({ name }).then((res) => {
      const { data } = res.data;
      setUsers((prev) => {
        // if the data is already present in the state, then don't add it again
        const filteredData = data?.filter((item) => {
          return !prev?.data.find((prevItem) => prevItem?.id === item.id);
        });
        // add the new data to the existing data
        return {
          data: [...prev.data, ...filteredData],
          loading: false,
        };
      });
    }).catch((err) => {
      const errorMessage = handleError(err);
      message.error(errorMessage || "Something went wrong");
      setUsers((prev) => ({ ...prev, loading: false }));
    });
  }

  const GetDepartments = useCallback(() => {
    setDepartments((prev) => ({ ...prev, loading: true }));
    const { getAllRecords } = departmentModule

    getAllRecords().then((res) => {
      const data = res.data.data
      setDepartments((prev) => {
        // if the data is already present in the state, then don't add it again
        const filteredData = data?.filter((item) => {
          return !prev?.data.find((prevItem) => prevItem?.id === item.id);
        });
        // add the new data to the existing data
        return {
          data: [...prev.data, ...filteredData],
          loading: false,
        };
      });
    }).catch((err) => {
      const errorMessage = handleError(err);
      message.error(errorMessage || "Something went wrong");
      setDepartments((prev) => ({ ...prev, loading: false }));
    });
  }, [departmentModule]);

  const GetOrganizations = useCallback(() => {
    setOrganizations((prev) => ({ ...prev, loading: true }));
    const { getAllRecords } = organizationModule

    getAllRecords().then((res) => {
      const { data } = res?.data
      setOrganizations((prev) => {
        // if the data is already present in the state, then don't add it again
        const filteredData = data?.filter((item) => {
          return !prev?.data.find((prevItem) => prevItem?.id === item.id);
        });
        // add the new data to the existing data
        return {
          data: [...prev.data, ...filteredData],
          loading: false,
        };
      });
    }).catch((err) => {
      const errorMessage = handleError(err);
      message.error(errorMessage || "Something went wrong");
      setOrganizations((prev) => ({ ...prev, loading: false }));
    });
  }, [organizationModule]);

  const handleReportTypeChange = useCallback((reportType: keyof typeof ReportType) => {
    setReportType(reportType);

    if (reportType === ReportType.department && departments.data.length === 0) {
      GetDepartments();
    }

    if (reportType === ReportType.organization && organizations.data.length === 0) {
      GetOrganizations();
    }
  }, [GetDepartments, GetOrganizations, departments.data.length, organizations.data.length]);

  useEffect(() => {
    if (debouncedUsersTerm !== "") {
      GetUsers(debouncedUsersTerm)
    }
  }, [debouncedUsersTerm])

  return (
    <Modal
      title="Export to Excel" open={isModalOpen}
      onCancel={() => setIsModalOpen(false)}
      okText="Export"
      okButtonProps={{
        form: "export_form", htmlType: "submit",
        loading: isLoading
      }}
    >
      <Form
        layout='vertical' form={form} onFinish={onSubmit} name='export_form'
      >
        <Form.Item
          name="date_range"
          label="Date Range"
          requiredMark={"optional"}
          rules={[{ required: true, message: 'Please select a date range' }]}
          style={{ marginBottom: 0 }}
        >
          <RangePicker
            className={style.date_picker} open={dateOpen}
            onOpenChange={(open) => setDateOpen(open)}
            renderExtraFooter={() => (
              <div className={style.date_footer}>
                {datePresets.map((preset, index) => (
                  <Button
                    key={`date_preset_${index}`}
                    type="ghost" size="small"
                    onClick={() => {
                      const fromDate = preset?.value?.[0]
                      const toDate = preset?.value?.[1]
                      form.setFieldsValue({ date_range: [fromDate, toDate] })
                    }}
                  >
                    {preset.text}
                  </Button>
                ))}

                <Button
                  style={{ marginRight: 0, marginLeft: "auto" }}
                  type='primary'
                  onClick={() => setDateOpen(false)}
                >
                  Ok
                </Button>
              </div>
            )}
          />
        </Form.Item>

        <Form.Item
          name="reportType" requiredMark={"optional"} style={{ marginBottom: 0 }}
          rules={[{ required: true, message: 'Please select a report type' }]}
        >
          <CustomSelect
            label='Report Type'
            options={getOptionsFromEnum(ReportType).map((item) => ({
              label: capitalize(item?.label),
              value: item?.value
            }))}
            value={reportType}
            onChange={(reportType) => handleReportTypeChange(reportType as keyof typeof ReportType)}
          />
        </Form.Item>

        <div className='mt-3'>
          {(reportType === ReportType.users) && (
            <Form.Item
              name="userIds" requiredMark={"optional"}
              rules={[{ required: true, message: 'Please select a user' }]}
            >
              <SelectWithSearch
                asterisk={false} label={"Users"}
                loading={users?.loading} mode="multiple"
                options={users?.data?.map((user) => ({
                  label: `${user?.firstName} ${user?.lastName}`,
                  value: `${user?.id}`
                }))}
                onSearch={(value) => setUserTerms(value)}
                notFoundDescription={`${(usersTerm && !users.loading) ? `No employees found, modify your search and try again` : "Search for employees to generate report for"}`}
              />
            </Form.Item>
          )}

          {(reportType === ReportType.department) && (
            <Form.Item name="departmentId" requiredMark={"optional"}
              rules={[{ required: true, message: 'Please select a department' }]}
            >
              <SelectWithSearch
                asterisk={false} label={"Departments"}
                loading={departments?.loading}
                options={departments?.data?.map((department) => ({
                  label: department?.title,
                  value: `${department?.id}`
                }))}
                onSearch={() => { }}
              />
            </Form.Item>
          )}
        </div>

        {(reportType === ReportType.organization) && (
          <Form.Item name="organizationId" requiredMark={"optional"}
            rules={[{ required: true, message: 'Please select an organization' }]}
          >
            <SelectWithSearch
              asterisk={false} label={"Organizations"}
              loading={organizations?.loading}
              options={organizations?.data?.map((organization) => ({
                label: organization?.name,
                value: `${organization?.id}`
              }))}
              onSearch={() => { }}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}

export default AttendanceExport;