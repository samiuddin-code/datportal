import { Calendar, momentLocalizer, Event } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useCallback, useEffect, useState } from "react";
import { AttendanceType, UserAttendance } from "@modules/Attendance/types";
import { AttendanceStatus } from "@helpers/commonEnums";
import { isDateGreaterThan } from "@helpers/common";
import { RESOURCE_BASE_URL } from "@helpers/constants";
const localizer = momentLocalizer(moment);


const CalendarComponent = ({ data, month, year, onCellClick }: {
    data: UserAttendance,
    month: number,
    year: number,
    onCellClick: (editType: "new" | "edit", date?: Date, id?: number | null) => void;
}) => {

    console.log("year", year);
    console.log("month", month);
    const [events, setEvents] = useState<{ id: number, start: Date, end: Date, title: string }[]>([]);
    let holidays : number[] = [];
    data.workingHour.hours.forEach((ele) => {
        if(ele.closed){
            holidays.push(ele.day)
        }
    })

    const dayPropGetter = useCallback(
        (date: Date) => ({
            ...((Number(data.attendanceData?.find(item => moment(item.day).get("D") === moment(date).get("D"))?.status) === AttendanceStatus.incomplete) && {
                className: 'incomplete-hours',
                style: {
                    backgroundColor: 'rgba(255, 140, 0, 0.6)'
                },
            }),
            ...((data?.attendanceData.find(item => moment(item.day).get("D") === moment(date).get("D"))?.status === AttendanceStatus.absent) && {
                className: 'absent',
                style: {
                    backgroundColor: 'rgba(247,5,5, 0.4)',
                },
            }),
            ...((data?.attendanceData.find(item => moment(item.day).get("D") === moment(date).get("D"))?.status === AttendanceStatus.late) && {
                className: 'late',
                style: {
                    backgroundColor: 'rgba(245,188,2, 0.4)',
                },
            }),
            ...((data?.attendanceData.find(item => moment(item.day).get("D") === moment(date).get("D"))?.status === AttendanceStatus.complete) && {
                style: {
                    backgroundColor: 'white',
                },
            }),
            ...(( holidays.includes(moment(date).day()) || (moment(date).month() !== month)) && {
                style: {
                    backgroundColor: 'var(--color-light-50)',
                },
            }),
            ...(isDateGreaterThan(new Date(), date) && {
                className: 'incomplete-hours',
                style: {
                    background: `url("${RESOURCE_BASE_URL}public/icons/lines.png")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover'
                },
            }),
        }),
        [events]
    )

    useEffect(() => {
        const _temp: any[] = []
        data.leaves?.forEach(leave => {
            _temp.push({
                id: leave.id,
                start: moment(leave.leaveFrom).toDate(),
                end: moment(leave.leaveTo).toDate(),
                title: leave?.purpose + " (On leave)",
            })
        })
        data.publicHolidays?.forEach(leave => {
            _temp.push({
                id: leave.id,
                start: moment(leave.date).toDate(),
                end: moment(leave.date).toDate(),
                title: leave?.title,
            })
        })
        setEvents(_temp);
    }, [data.leaves])

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Calendar
                components={{
                    month: {
                        dateHeader: ({ date, label }) => {
                            return (
                                <div
                                    onClick={event => {
                                        const recordId = data?.attendanceData?.find(item => moment(item.day).get("D") === moment(date).get("D"))?.recordId
                                        if (!(holidays.includes(moment(date).day())  || (moment(date).month() !== month)) && !isDateGreaterThan(new Date(), date)) {
                                            onCellClick(recordId ? "edit" : "new",
                                                date,
                                                recordId
                                            )
                                        }
                                    }}
                                    style={{
                                        width: '100%',
                                        height: '8vh',
                                        cursor: (!(holidays.includes(moment(date).day())  || (moment(date).month() !== month)) && !isDateGreaterThan(new Date(), date)) ? 'pointer' : 'not-allowed',
                                        fontSize: 'var(--font-size-lg)',
                                        fontWeight: '600',
                                    }}
                                >{label}</div>
                            );
                        },

                    }
                }}
                localizer={localizer}
                date={year && month ? new Date(`${year}/${month + 1}/01`) : new Date()}
                defaultView="month"
                events={events}
                style={{ height: "70vh", color: 'var(--color-dark-main)' }}
                views={["month"]}
                dayPropGetter={dayPropGetter}
                toolbar={false}
            />
            <div style={{ alignSelf: 'flex-start' }}>
                <div style={{ border: '1px solid var(--color-border)', display: 'flex', padding: '0.5rem', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: 'var(--font-size-sm)' }}>
                        <div style={{ width: '1rem', height: '1rem', backgroundColor: 'rgba(247,5,5, 0.4)', borderRadius: '50%' }} />
                        <p style={{ margin: 0 }}>Absent</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: 'var(--font-size-sm)' }}>
                        <div style={{ width: '1rem', height: '1rem', backgroundColor: 'rgba(255, 140, 0, 0.6)', borderRadius: '50%' }} />
                        <p style={{ margin: 0 }}>Incomplete hours</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: 'var(--font-size-sm)', alignSelf: 'flex-start' }}>
                        <div style={{ width: '1rem', height: '1rem', backgroundColor: 'rgba(245,188,2, 0.4)', borderRadius: '50%' }} />
                        <p style={{ margin: 0 }}>Late</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: 'var(--font-size-sm)', alignSelf: 'flex-start' }}>
                        <div style={{ width: '1rem', height: '1rem', backgroundColor: 'var(--color-light-50)', borderRadius: '50%' }} />
                        <p style={{ margin: 0 }}>Weekend</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default CalendarComponent;