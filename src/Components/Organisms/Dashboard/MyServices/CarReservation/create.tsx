import { Form, DatePicker, message, TimePicker } from "antd";
import {
  CustomInput,
  CustomModal,
  CustomErrorAlert,
  CustomButton,
  SelectWithSearch,
  ImageUploader,
} from "../../../../Atoms";
import styles from "../../../Common/styles.module.scss";
import Skeletons from "../../../Skeletons";
import { useEffect, useState } from "react";
import { HandleServerErrors } from "../../../../Atoms/ServerErrorHandler";
import { errorHandler } from "../../../../../helpers";
import { PropTypes } from "../../../Common/common-types";
import { CarReservationModule } from "@modules/CarReservation";
import { CarReservationResponseObject } from "@modules/CarReservation/types";
import { CarReservationPermissionsEnum } from "@modules/CarReservation/permissions";
import { useDebounce } from "@helpers/useDebounce";
import { ProjectModule } from "@modules/Project";
import { ProjectTypes } from "@modules/Project/types";
import { RangePickerProps } from "antd/lib/date-picker";
import moment from "moment";

interface CarReservationModalProps extends Omit<PropTypes, "type"> {
  permissions: { [key in CarReservationPermissionsEnum]: boolean };
}

type FormValueTypes = {
  purpose: string,
  companyCarId: 1 | 2 | 3 | 4 | 5,
  date: any,
  checkIn: any,
  checkOut: any,
  projectId?: number,
  files?: any
}

export const CarReservationModal = (props: CarReservationModalProps) => {
  const {
    openModal, onCancel,
    reloadTableData, permissions: {
      createcarReservationRequest
    }
  } = props;
  const [form] = Form.useForm();
  const module = new CarReservationModule();
  const projectModule = new ProjectModule();
  const [recordData, setRecordData] = useState<Partial<CarReservationResponseObject>>();

  // Project Search Term
  const [searchTermProject, setSearchTermProject] = useState("");
  const debouncedSearchTermProject = useDebounce(searchTermProject, 500);
  const [projectOptions, setProjectOptions] = useState<ProjectTypes[]>([])
  // Project Search
  const onProjectSearch = () => {
    if (debouncedSearchTermProject) {
      projectModule.getAllRecords({ title: debouncedSearchTermProject }).then((res) => {

        const { data } = res;

        setProjectOptions((prev) => {
          // if the data is already present in the state, then don't add it again
          const filteredData = data?.data?.filter((item) => {
            return !prev?.find((prevItem) => prevItem.id === item.id);
          });
          // add the new data to the existing data
          return [...prev, ...filteredData];
        })
      }).catch((err) => {
        message.error(err?.response?.data?.message)
      })
    }
  }

  useEffect(() => {
    onProjectSearch()
  }, [debouncedSearchTermProject])



  const handleErrors = (err: any) => {
    const error = errorHandler(err);
    if (typeof error.message == "string") {
      setRecordData({ ...recordData, error: error.message });
    } else {
      let errData = HandleServerErrors(error.message, []);
      form.setFields(errData);
      setRecordData({ ...recordData, error: "" });
    }
  };

  const handleAlertClose = () => {
    setRecordData({ ...recordData, error: "" });
  };
  useEffect(() => {
    form.resetFields();
  }, [openModal])


  const onFinish = (formValues: FormValueTypes) => {
    setRecordData({ ...recordData, buttonLoading: true });
    const { files } = formValues;

    const requestData = {
      companyCarId: formValues.companyCarId,
      fromDate: formValues.date._d.toISOString().substring(0, 10) + formValues.checkIn._d.toISOString().substring(10,),
      toDate: formValues.date._d.toISOString().substring(0, 10) + formValues.checkOut._d.toISOString().substring(10,)
    }

    module.checkAvailability(requestData).then(res => {
      if (res.data.data.isAvailable) {
        const formData = new FormData();
        const excludeFields = ["files", "checkIn", "checkOut"];
        Object.entries(formValues).forEach((ele: any) => {
          if (!excludeFields.includes(ele[0])) {
            if (ele[0] === "date") {
              formData.append("fromDate", formValues.date._d.toISOString().substring(0, 10) + formValues.checkIn._d.toISOString().substring(10,))
              formData.append("toDate", formValues.date._d.toISOString().substring(0, 10) + formValues.checkOut._d.toISOString().substring(10,))
            }
            else formData.append(ele[0], ele[1]);
          }
        });

        // add files to form data 
        const _files: File[] = files?.fileList?.map((file: any) => {
          return file.originFileObj
        });

        if (_files?.length) {
          for (let i = 0; i < _files.length; i++) {
            formData.append('files[]', _files[i]);
          }
        }

        if (createcarReservationRequest === true) {
          module.createRecord(formData).then((res) => {
            reloadTableData();
            onCancel();
            setRecordData((prev) => ({ ...prev, buttonLoading: false }));
          }).catch((err) => {
            handleErrors(err);
            setRecordData((prev) => ({ ...prev, buttonLoading: false }));
          });
        } else {
          setRecordData((prev) => ({ ...prev, buttonLoading: false }));
          message.error("You don't have permission to create this record");
        }
      }
      else {
        message.error("The car is already booked for these dates")
      }
    }).catch(err => {
      message.error("Something went wrong")
      setRecordData({ ...recordData, buttonLoading: false });
    })
  };

  // eslint-disable-next-line arrow-body-style
  const disabledDate: RangePickerProps['disabledDate'] = current => {
    // Can not select days before today and today
    return current && current < moment().endOf('day').subtract(1, 'day');
  };

  return (
    <CustomModal
      visible={openModal}
      closable={true}
      onCancel={onCancel}
      titleText={"Add New Request"}
      showFooter={false}
    >
      {recordData?.loading ? (
        <Skeletons items={10} />
      ) : (
        <Form className={styles.form} onFinish={onFinish} form={form}>
          {recordData?.error && (
            <CustomErrorAlert
              description={recordData?.error}
              isClosable
              onClose={handleAlertClose}
            />
          )}

          <div>
            <Form.Item name="purpose" rules={[{ required: true, message: "Please add a purpose" }]}>
              <CustomInput size="w100" label={"Purpose"} asterisk type="textArea" placeHolder="Enter Purpose" />
            </Form.Item>
          </div>

          <div style={{ width: '100%' }}>
            <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-dark-main)', width: '33%' }}>
              Date
              <span style={{ color: 'var(--color-red-yp)' }}> *</span>
              <Form.Item name="date" rules={[{ required: true, message: "Please select date " }]}>
                <DatePicker
                  disabledDate={disabledDate}
                  style={{ borderRadius: '0.25rem', borderWidth: 2, width: '100%', borderColor: 'var(--color-border)' }}
                />
              </Form.Item>
            </label>
            <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-dark-main)', width: '33%' }}>
              From
              <span style={{ color: 'var(--color-red-yp)' }}> *</span>
              <Form.Item name="checkIn" rules={[{ required: true, message: "Please select date " }]}>
                <TimePicker
                  showSecond={false}
                  minuteStep={15}
                  style={{ borderRadius: '0.25rem', borderWidth: 2, width: '100%', borderColor: 'var(--color-border)' }} />
              </Form.Item>
            </label>
            <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-dark-main)', width: '33%' }}>
              To
              <span style={{ color: 'var(--color-red-yp)' }}> *</span>
              <Form.Item name="checkOut" rules={[{ required: true, message: "Please select date " }]}>
                <TimePicker
                  showSecond={false}
                  minuteStep={15}
                  style={{ borderRadius: '0.25rem', borderWidth: 2, width: '100%', borderColor: 'var(--color-border)' }} />
              </Form.Item>
            </label>

          </div>

          <div>
            {/** Project Type */}
            <Form.Item
              className={"color-dark-main"}
              name="projectId"
            >
              <SelectWithSearch
                label='Select Project'
                notFoundDescription="No projects found., Please search for projects."
                onSearch={(value) => setSearchTermProject(value)}
                options={projectOptions?.map((item) => ({
                  label: `${item.referenceNumber} | ${item.title}`,
                  value: item.id,
                }))}
                onChange={(value) => form.setFieldsValue({
                  projectId: value,
                })}
                asterisk={false}
              />
            </Form.Item>
          </div>
          <div>
            <ImageUploader name="files" required={false} multiple />
          </div>
          <div className="d-flex justify-end mt-4">
            <CustomButton size="normal" fontSize="sm" onClick={onCancel} type="plain">
              Cancel
            </CustomButton>
            <CustomButton
              type="primary"
              size="normal"
              fontSize="sm"
              htmlType="submit"
              loading={recordData?.buttonLoading}
            >
              Add Request
            </CustomButton>
          </div>
        </Form>
      )}
    </CustomModal>
  );
};
