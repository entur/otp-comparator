import {
    parseISO,
    format,
    startOfMinute,
    roundToNearestMinutes,
} from 'date-fns'

import nob from 'date-fns/locale/nb'

const TIME_FORMAT = 'HH:mm'
const LONG_DATE_FORMAT = 'EEEE d. MMMM'
const LONG_DATE_TIME_FORMAT = `${LONG_DATE_FORMAT} ${TIME_FORMAT}`

function roundDate(date: Date): Date {
    const seconds = date.getSeconds()

    if (seconds >= 45) return roundToNearestMinutes(date)
    return startOfMinute(date)
}

function formatDateAsTime(date: Date): string {
    return format(date, TIME_FORMAT)
}

export function formatTime(timestamp: string): string {
    const date = parseISO(timestamp)
    const roundedDate = roundDate(date)
    return formatDateAsTime(roundedDate)
}

function formatDateAsDateTimeLong(date: Date): string {
    return format(date, LONG_DATE_TIME_FORMAT, {
        locale: nob,
    })
}

export function formatDateTimeLong(timestamp: string): string {
    const date = parseISO(timestamp)
    const roundedDate = roundDate(date)
    return formatDateAsDateTimeLong(roundedDate)
}
