import apiInstance from "@services/axiosInstance";
import { GetResponseTypes } from "@modules/Common/common.interface";
import { AttendanceParams, AttendanceReportType, AttendanceType } from "./types";

export class AttendanceModule {
    private readonly endPoint = "attendance";

    /**Get all Attendance records
     * @param query - query params
     */
    getAllRecords = <Type extends GetResponseTypes<AttendanceType[], AttendanceParams>>(query?: Type['query']) => {
        return apiInstance.get<Exclude<Type, 'query'>>(this.endPoint, { params: query });
    };

    /**Get Attendance record by id
     * @param id - Attendance id
     */
    getRecordById = <Type extends GetResponseTypes<AttendanceType>>(id: number) => {
        return apiInstance.get<Exclude<Type, 'query'>>(`${this.endPoint}/${id}`);
    };
    /**Get Attendance record by id
     * @param id - Attendance id
     */
    getUserAttendance = (query: { year: number, month: number, userId: number, type?: "1" | "2" }) => {
        return apiInstance.get(this.endPoint + "/getUserAttendance", { params: query });
    };

    /**Get Attendance record by id
     * @param id - Attendance id
     */
    findUserAttendanceForPayroll = (query: { fromDate: Date, toDate: Date, userId: number, type?: "1" | "2" }) => {
        return apiInstance.get(this.endPoint + "/findUserAttendanceForPayroll", { params: query });
    };

    /**Find published Attendance records
     * @param query - query params
     */
    findPublished = <Type extends GetResponseTypes<AttendanceType[], AttendanceParams>>(query?: Type['query']) => {
        return apiInstance.get<Exclude<Type, 'query'>>(`${this.endPoint}/published`, { params: query });
    }

    /**Delete Attendance record
    * @param id - Attendance id
    */
    deleteRecord = (id: number) => {
        return apiInstance.delete(`${this.endPoint}/${id}`);
    };

    /**Create new Attendance record
     * @param data - Attendance data
     */
    createRecord = (data: Partial<AttendanceType>) => {
        return apiInstance.post<{ data: AttendanceType }>(this.endPoint, data);
    };

    /**Update Attendance record
    * @param data - Attendance data
    * @param id - Attendance id
    */
    updateRecord = (data: Partial<AttendanceType>, id: number) => {
        return apiInstance.patch(`${this.endPoint}/${id}`, data);
    };

    generateReport = (data: AttendanceReportType) =>{
        return apiInstance.post(`${this.endPoint}/generateReport`, data, {responseType: 'blob'});
    }
}