import { ChangeEvent, Dispatch, SetStateAction } from 'react'

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

// "get" methods

type DialogButtonParams = {
  setDialog: Dispatch<SetStateAction<any>>
  buttonClass: string
  dialog: string
  params?: any
  text: string
  stopPropagate?: boolean
}

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

type InputHandler = (e: ChangeEvent<HTMLInputElement>) => void

export const getInput = (
    fieldName: string,
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
                placeholder={fieldName}
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

type OptionType = Record<string, any>

export const getSelect = (
  value: string | number,
  handler: (e: ChangeEvent<HTMLSelectElement>) => void,
  options: OptionType[],
  keyField: string,
  valueField: string,
  contentField: string
) => {
  return (
    <select className="select-mini" value={value} onChange={handler}>
      {options.map((option) => (
        <option key={option[keyField]} value={option[valueField]}>
          {option[contentField]}
        </option>
      ))}
    </select>
  )
}