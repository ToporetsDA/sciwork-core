import { ChangeEvent } from 'react'
import { DateTime, DurationUnits } from 'luxon'

import {
  createUserData,
  createProjectFromObject,
  createActivityFromObject,
  createFunctionalSettings,
  createDisplaySettings
} from './classes'

import {
  DIALOG_BUTTON_PARAMS,
  DOMAIN_TYPE,
  INPUT_HANDLER,
  OPTION_TYPE,
  TIME_UNIT,
  NORMALIZER,
  MARKABLE_VALUE,
  FORM_FIELD_TYPES,
  FORM_FIELD_PARAMS,
  BUILDER
} from './constants'

import '../Styles/lib/buttons.sass'
import '../Styles/lib/input.sass'
import '../Styles/lib/select.sass'

// ==================================
// GENERAL
// ==================================

export const sortByIds = <T extends { _id: string }>(
  array: T[],
  ids: string[],
  fullArr: T[]
): T[] => {
  const sortedArray: T[] = []
  for (let i = 0; i < ids.length; i++) {
    let item = array.find(a => a._id === ids[i])
    if (!item) {
      console.log(ids[i], 'is a new item, look from source', fullArr)
      item = fullArr.find(a => a._id === ids[i])
    }
    if (item) sortedArray.push(item)
  }
  return sortedArray
}

// ==================================
// EXTERNAL
// ==================================

export const getFromLocalStorage = <T = any>(
    get: boolean,
    name: string,
    _id?: string,
    val?: T
): T[] | void => {
    if (get) {
        const saved = localStorage.getItem(name)
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                if (_id) {
                    const userDataBlock = Array.isArray(parsed)
                        ? parsed.find((entry: any) => entry.userId === _id)
                        : null
                    return userDataBlock?.data || []
                }
                else {
                    return Array.isArray(parsed) ? parsed : []
                }
            } catch (err) {
                console.error('Invalid localStorage data:', err)
            }
        }
        return []
  } else {
    localStorage.setItem(name, JSON.stringify(val))
  }
}

// ==================================
// Date and time
// ==================================

export const DaysTillEvent = (diff: number, date: string, time: string): boolean => {
  const now = new Date()

  const [year, month, day] = date.split('-').map(Number)
  const [hours, minutes] = time.split(':').map(Number)
  const eventDate = new Date(year, month - 1, day, hours, minutes)

  const timeDiff = now.getTime() - eventDate.getTime()
  return timeDiff <= diff * 24 * 60 * 60 * 1000
}

export const toUTC = (localISO: string, timezone: string) => {
  return DateTime.fromISO(localISO, { zone: timezone }).toUTC().toISO()
}

export const fromUTC = (utcISO: string, timezone: string) => {
  return DateTime.fromISO(utcISO, { zone: "utc" })
    .setZone(timezone)
    .toFormat("yyyy-MM-dd HH:mm")
}

const toDateTime = (value: string | Date | DateTime): DateTime => {
  if (value instanceof DateTime) return value
  if (value instanceof Date) return DateTime.fromJSDate(value)
  return DateTime.fromISO(value)
}

export const diffTime = (
  minuend: string | Date | DateTime,
  subtrahend: string | Date | DateTime,
  resultVolume: TIME_UNIT
): number => {
  const a = toDateTime(minuend)
  const b = toDateTime(subtrahend)

  return a.diff(b).as(resultVolume)
}

export const nowUTC = (): DateTime => {
  return DateTime.utc()
}

const getUTC = (
  date: string | null,
  time: string | null,
  timeZone: string,
  direction: "toDomain" | "toUI"
) => {
  const fallbackTime = "00:00"
  const fallbackDate = `${nowUTC()}`.slice(0, 10)

  const iso = `${date ?? fallbackDate}T${time ?? fallbackTime}:00`

  const resultISO =
    direction === "toDomain"
      ? toUTC(iso, timeZone)          // local -> UTC
      : fromUTC(iso, timeZone)       // UTC -> local

  if (!resultISO) {
    return { date: "0000-00-00", time: "00:00" }
  }

  return {
    date: resultISO.slice(0, 10),
    time: resultISO.slice(11, 16)
  }
}

// ==================================
// jsx elements
// ==================================

export const getDialogButton = ({
  setDialog,
  buttonClass,
  dialog,
  params,
  text,
  stopPropagate = false,
}: DIALOG_BUTTON_PARAMS) => {
  return (
    <button
      className={`${buttonClass}`}
      onClick={e => {
        if (stopPropagate) e.stopPropagation()
        setDialog({
            name: dialog,
            params,
        })
      }}
    >
      {text}
    </button>
  )
}

export const getInput = (
    fieldName: string,
    placeholderText: string,
    type: string,
    value: string | number,
    checked: boolean = false,
    handler: INPUT_HANDLER,
    disabled: boolean = false,
    section?: string,
    width: number = 50
) => {
    return (
        <div className="input-group field" style={{ width: `${width}%` }}>
            <input
                type={type}
                className="input-field"
                placeholder={placeholderText}
                name={fieldName}
                id={fieldName}
                data-section={section}
                disabled={disabled}
                value={value}
                checked={checked}
                onChange={handler}
            />
            <label htmlFor={fieldName} className="input-label">
                {fieldName}
            </label>
        </div>
    )
}

export const getItemById = <T extends { _id: string }>(array: T[], _id: string): T | {} => {
  return array.find(item => item._id === _id) || {}
}

export const getSelect = (
  value: string | number,
  handler: (e: ChangeEvent<HTMLSelectElement>) => void,
  options: OPTION_TYPE[],
  showOptions: string[],
  disabled: boolean,
  keyField?: string,
  valueField?: string
) => {
  return (
    <select className="select-mini" value={value} onChange={handler} disabled={disabled}>
      {options.map((option, index) => {
        const isObject = (typeof option === "object")

        const key = isObject && keyField
          ? option[keyField]
          : option

        const val = isObject && valueField
          ? option[valueField]
          : option

        return (
          <option key={key} value={val}>
            {showOptions[index]}
          </option>
        )
      })}
    </select>
  )
}

// ==================================
// wisiwig data
// ==================================

export const updateTreeItem = (arr: any[], targetId: string, field: string, val: any): any[] => {
  return arr.map(a => {
    if (a._id === targetId) {
      return { ...a, val }
    } 
    if (a[field] && a[field].length) {
      return { ...a, [field]: updateTreeItem(a[field], targetId, field, val) }
    }
    return a
  })
}

export const updateTreeItemField = (arr: any[], targetId: string, field: string, valField: string, val: any): any[] => {
  return arr.map(a => {
    if (a._id === targetId) {
      return { ...a, [valField]: val }
    } 
    if (a[field] && a[field].length) {
      return { ...a, [field]: updateTreeItemField(a[field], targetId, field, valField, val) }
    }
    return a
  })
}

export const verUp = (obj: any, type: DOMAIN_TYPE): any => {
  const tmp = {
    ...obj,
    __v: obj.__v
  }
  const handlers: Record<DOMAIN_TYPE, (obj: any) => any> = {
    UserData:           obj => createUserData(obj),
    Project:            obj => createProjectFromObject(obj),
    Activity:           obj => createActivityFromObject(obj),
    FunctionalSettings: obj => createFunctionalSettings(obj),
    DisplaySettings:    obj => createDisplaySettings(obj)
  }
  return handlers[type]?.(obj)
}

// ==================================
// Domain normalization pipelines
// ==================================

// --- save from/autofill form

const normDate = (
  v: string,
  s: any,
  direction: "toDomain" | "toUI"
): string => {
  if (!s?.timeZone) {// Unexpected: user used reserved field name
    return v
  }

  const { date } = getUTC(v, null, s.timeZone, direction)
  return date
}

const normTime = (
  v: string,
  s: any,
  direction: "toDomain" | "toUI"
): string => {
  if (!s?.timeZone) {// Unexpected: user used reserved field name
    return v
  }

  const { time } = getUTC(null, v, s.timeZone, direction)
  return time
}

const normMarkable = (
  v: MARKABLE_VALUE | string,
  s: any,
  direction: "toDomain" | "toUI"
): MARKABLE_VALUE | string => {

  if (!s?.timeZone) return v
  if (typeof v === "string") return v

  const { date, startTime, endTime } = v

  const { date: dateN, time: startN } = getUTC(
    date,
    startTime,
    s.timeZone,
    direction
  )

  const { time: endN } = getUTC(
    date,
    endTime,
    s.timeZone,
    direction
  )

  return {
    ...v,
    date: dateN,
    startTime: startN,
    endTime: endN
  }
}

const NORMALIZERS: Record<string, NORMALIZER> = {
  startDate: normDate,
  endDate: normDate,
  startTime: normTime,
  endTime: normTime,
  markable: normMarkable
}

export const formatFormValues = (
  formValues: any,
  settings: any,
  direction: "toDomain" | "toUI"
): any => {

  if (Array.isArray(formValues)) {
    return formValues.map(v => formatFormValues(v, settings, direction))
  }

  if (formValues && typeof formValues === "object") {
    const out: Record<string, any> = {}

    for (const key in formValues) {
      const value = formValues[key]

      if (NORMALIZERS[key]) {
        out[key] = NORMALIZERS[key](value, settings, direction)
      }
      else {
        out[key] = formatFormValues(value, settings, direction)
      }
    }

    return out
  }

  return formValues
}

// --- handle form field generation ---

const handleFormInput = (key: string, value: any, params: Extract<FORM_FIELD_PARAMS, { element: "input" }>) => {
  return getInput(
    key,
    params.type ?? "text",
    "",
    value || '',
    false,
    params.handler,
    params.disabled,
    undefined,
    80
  )
}

const handleFormSelect = (key: string, value: any, params: Extract<FORM_FIELD_PARAMS, { element: "select" }>) => {
  const options = params.options ?? []
  const displayOptions = options.map(o => o.toString())
  return getSelect(
    value,
    params.handler,
    options,
    displayOptions,
    params.disabled
  )
}

const BUILDERS: {
  input: BUILDER<"input">,
  select: BUILDER<"select">
} = {
  input: handleFormInput,
  select: handleFormSelect
} as const

export const handleFormField = <T extends FORM_FIELD_TYPES>(
  element: T,
  key: string,
  value: any,
  params: Extract<FORM_FIELD_PARAMS, { element: T }>
): any => {
  return BUILDERS[element](key, value, params)
}

// --- validate form input ---

// ==================================
