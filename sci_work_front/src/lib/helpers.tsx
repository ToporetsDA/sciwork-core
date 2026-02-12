import { ChangeEvent } from 'react'

import {
  createUserData,
  createProjectFromObject,
  createActivityFromObject,
  createFunctionalSettings,
  createDisplaySettings
} from './classes'

import {
  DialogButtonParams,
  DomainType,
  InputHandler,
  OptionType,
} from './constants'

import '../Styles/lib/buttons.sass'
import '../Styles/lib/input.sass'
import '../Styles/lib/select.sass'

export const DaysTillEvent = (diff: number, date: string, time: string): boolean => {
  const now = new Date()

  const [year, month, day] = date.split('-').map(Number)
  const [hours, minutes] = time.split(':').map(Number)
  const eventDate = new Date(year, month - 1, day, hours, minutes)

  const timeDiff = now.getTime() - eventDate.getTime()
  return timeDiff <= diff * 24 * 60 * 60 * 1000
}

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

// --- "get" methods ---

export const getDialogButton = ({
  setDialog,
  buttonClass,
  dialog,
  params,
  text,
  stopPropagate = false,
}: DialogButtonParams) => {
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

export const getInput = (
    fieldName: string,
    placeholderText: string,
    type: string,
    value: string | number,
    checked: boolean = false,
    handler: InputHandler,
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
  options: OptionType[],
  showOptions: string[],
  keyField?: string,
  valueField?: string
) => {
  return (
    <select className="select-mini" value={value} onChange={handler}>
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

export const verUp = (obj: any, type: DomainType): any => {
  const tmp = {
    ...obj,
    __v: obj.__v
  }
  const handlers: Record<DomainType, (obj: any) => any> = {
    UserData:           obj => createUserData(obj),
    Project:            obj => createProjectFromObject(obj),
    Activity:           obj => createActivityFromObject(obj),
    FunctionalSettings: obj => createFunctionalSettings(obj),
    DisplaySettings:    obj => createDisplaySettings(obj)
  }
  return handlers[type]?.(obj)
}