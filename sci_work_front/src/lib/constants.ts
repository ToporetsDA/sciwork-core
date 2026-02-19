import { ChangeEvent, Dispatch, SetStateAction } from 'react'
import { DurationUnits } from 'luxon'

// ==================================
// Core
// ==================================

// --- classes.ts ---

export type USER = {
  id: string
  access: number
}

export type META_ACTIVITY = {
  _id: string
  name: string
  type: []
  startDate: string
  endDate: string
  isTimed: boolean
  startTime: string
  endTime: string
  repeat: boolean
  days: []
  thirdParty: boolean
  serviceName: string
  userList: USER[]
  activities: META_ACTIVITY[]
}

export type SCHEDULE_KIND = "start" | "repeat" | "end" | undefined

// --- helpers.ts ---

export type DIALOG_BUTTON_PARAMS = {
  setDialog: Dispatch<SetStateAction<any>>
  buttonClass: string
  dialog: string
  params?: any
  text: string
  stopPropagate?: boolean
}

export type DOMAIN_TYPE =
    | "UserData"
    | "Project"
    | "Activity"
    | "FunctionalSettings"
    | "DisplaySettings"

export type INPUT_HANDLER = (e: ChangeEvent<HTMLInputElement>) => void

export type SELECT_HANDLER = (e: ChangeEvent<HTMLSelectElement>) => void

export type OPTION_TYPE = Record<string, any> | string | number

const TIME_UNITS = [
  'milliseconds',
  'seconds',
  'minutes',
  'hours',
  'days'
] as const satisfies readonly DurationUnits[]
export type TIME_UNIT = typeof TIME_UNITS[number]

export type NORMALIZER = (
  v: any,
  s: any,
  direction: "toDomain" | "toUI"
) => any

export interface MARKABLE_VALUE {
  date: string | null
  startTime: string | null
  endTime: string | null
  [key: string]: any
}

export type FORM_FIELD_TYPES =
    | "select"
    | "input"

export type FORM_FIELD_PARAMS =
    | {
        element: "input"
        type: string
        handler: INPUT_HANDLER
        disabled: boolean
    }
    | {
        element: "select"
        handler: SELECT_HANDLER
        options?: string[]
        disabled: boolean
    }

export type BUILDER<T extends FORM_FIELD_TYPES> = (
  key: string,
  value: any,
  params: Extract<FORM_FIELD_PARAMS, { type: T }>
) => JSX.Element

// --- hooks.ts ---

// ==================================
// Main
// ==================================

// --- App.js ---

export const DEFAULT_PROFILE_DATA = Object.freeze({   // [isRequired, type]
    basic: {
        name: {
            required: true,
            type: 'string'
        },
        middleName: {
            required: false,
            type: 'string'
        },
        surName: {
            required: true,
            type: 'string'
        },
        patronimic: {
            required: false,
            type: 'string'
        },
        statusName: {
            required: true,
            type: 'string'
        },
        mail: {
            required: true,
            type: 'mail'
        },
        safetyMail: {
            required: false,
            type: 'mail'
        },
        phone: {
            required: false,
            type: 'phone'
        },
        safetyPhone: {
            required: false,
            type: 'phone'
        },
    },
    fixed: ['genStatus', 'statusName', 'id'], //fields that can not be edited
    special: ['statusName'],// pass back from form to handle where it is used
    additional: {
      //will be added in beta-version
    }
})

export const DEFAULT_DISPLAY_SETTINGS = Object.freeze({   // [isRequired, type]
    basic: {
        language: {
            required: true,
            type: 'select',
            options: ['en', 'ua']
        },
    },
    fixed: ['_id', '__v'],       //fields that can not be edited
    special: [],// pass back from form to handle where it is used
    additional: {
      //will be added in beta-version
    }
})

export const DEFAULT_ITEM_STRUCTURE = Object.freeze({
    project: {
        name: 'text',
        startDate: 'date',
        endDate: 'date',
    },
    activity: {
        name: 'text',
        startDate: 'date',
        endDate: 'date',
        isTimed: 'checkbox',
        startTime: 'time',
        endTime: 'time',
        type: 'list',
        repeat: 'checkbox',
        days: 'list',
        thirdParty: 'checkbox',
        serviceName: 'text'
    },
    lists: {
        days: { many: true, options: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']},
        type: { many: false, options: [/*'Dev',*/ 'Group', 'Text', 'Chat', 'List', 'Table', 'Attendance', 'Report', /*'Test'*/]}
    },
    checks: {
        days:         {val: true, dep: "repeat"},
        serviceName:  {val: true, dep: "thirdParty"},
        startTime:    {val: true, dep: "isTimed"},
        endTime:      {val: true, dep: "isTimed"},
    }
})

// ==================================
// Page base
// ==================================

// --- AppHeader.js ---

export const PAGES = Object.freeze(['Home Page', 'Schedule', 'Projects/Subjects'])

export const MORE_PAGES = Object.freeze(['Profile', 'Notifications', 'Chats', 'Settings'])

// --- AppNav.js ---

// --- AppDynamicContent.js ---

// --- AppContend.js ---

// ==================================
// Pages
// ==================================

// --- HomePage.js ---

// --- Notifications.js ---

// --- Profile.js ---

// --- Projects.js ---

export const DISPLAY_OPTIONS = Object.freeze(new Map([
    ['tiles', 'grid'],
    ['list', 'flex'],
    ['table', 'table']
]))

// --- Schedule.js ---

export const DAYS_OF_WEEK = Object.freeze([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
])

export const DAYS_OF_WEEK_SHORT = Object.freeze([
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
    'Sun'
])

export const MONTHS = Object.freeze([
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
])

// --- Settings.js ---

// ==================================
// Specific
// ==================================

// --- ScheduleBoard.js ---

// ==================================
// Shared
// ==================================

// --- AppContext.js ---

// --- ControlPanel.js ---

export const DISPLAY_OPTIONS_CONTROLS = Object.freeze(["tiles", "list", "table"])

// --- CustomSelect.js ---

// --- Form.js ---

export type FORM_DEFAULTS = {
    basic: Record<string, [boolean, any]> // [isRequired, defaultValue]
    fixed: string[]
    additional?: Record<string, any>
}

// --- Item.js ---

export const ACTIVITY_TYPES = Object.freeze({
    Dev: "Dev",
    Group: "Group",
    Text: "Text",
    List: "List",
    Table: "List",
    Attendance: "List",
    Report: "List",
    Chat: "Chat",
    Page: "Dev"
})

export const SUB_ACTIVITY_TYPES = Object.freeze({
    List: "ListItem",
    Chat: "Message"
})

export const NO_ACTIONS_CONTAINER = Object.freeze(["Chat"])

// --- ItemActions.js ---

// --- ItemTable.js ---

// --- ItemTiles.js ---

export const ITEM_TYPES_LIST_BASED = Object.freeze([
    "List",
    "Chat",
    "Attendance",
    "Report"
])

// --- ToggleButton.js ---

export const LANGUAGES = Object.freeze([
    "en",
    "uk"
])

export const LANGUAGES_FULL = Object.freeze([
    "English",
    "Українська"
])

// ==================================
// Dialogs
// ==================================

// --- AddEditContent.js ---

export const TECH_FIELDS = Object.freeze(["_id", "creatorId"])

export const FIELD_TYPES = Object.freeze([
    "text",
    "checkbox"
])

// --- AddEditItem.js ---

// --- AddEditUserList.js ---

export const ITEM_KEYS_ALLOWED = Object.freeze([
    "name",
    "middleName",
    "surName",
    "patronimic",
    "genStatus",
    "access",
    "accessLevel"
])

export const ITEM_TYPES_ALLOWED = Object.freeze({
    name: "plain",
    middleName: "plain",
    surName: "plain",
    patronimic: "plain",
    genStatus: "access",
    access: "button",
    accessLevel: "combobox"
})

export const ITEM_KEYS = Object.freeze([
    "name",
    "middleName",
    "surName",
    "patronimic",
    "genStatus",
    "access"
])

export const ITEM_TYPES = Object.freeze({
    name: "plain",
    middleName: "plain",
    surName: "plain",
    patronimic: "plain",
    genStatus: "access",
    access: "button"
})

// --- JointEventOverlap.js ---

// --- LogIn.js ---

export const TYPE_OPTIONS = Object.freeze(['Register', 'Log in'])

// ==================================
// Items
// ==================================

// --- Chat.js ---

// --- Dev.js ---

// --- Group.js ---

// --- List.js ---

export const ITEMS_WITH_DIALOG_BUTTON = Object.freeze(["List", "Attendance", "Table", /*no Chat*/])

// --- Project.js ---

// --- Text.js ---

export const FONT_SIZES = Object.freeze([ "normal", "large", "larger"])

// ==================================
// SubItems
// ==================================

// --- ListItem.js ---

export const MARKABLE_FIELDS = Object.freeze([
    "checker",
    "name",
    "middleName",
    "surName",
    "patronimic"
])

export const MARKABLE_TYPES = Object.freeze({
    name: 'plain',
    middleName: 'plain',
    surName: 'plain',
    patronimic: 'plain',
    checker: 'checker'
})

// --- Message.js ---
