// ==================================
// Main
// ==================================

// --- App.js ---

export const DEFAULT_PROFILE_DATA = Object.freeze({   // [isRequired, type]
    basic: {
        name:         [true,  'string'],
        middleName:   [false, 'string'],
        surName:      [true,  'string'],
        patronimic:   [false, 'string'],
        statusName:   [true,  'string'],
        mail:         [true,  'mail'],
        safetyMail:   [false, 'mail'],
        phone:        [false, 'phone'],
        safetyPhone:  [false, 'phone'],
    },
    fixed: ['genStatus', 'statusName', 'id'],       //fields that can not be edited
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

// ==================================
// Dialogs
// ==================================

// --- AddEditContent.js ---

export const TECH_FIELDS = Object.freeze(["_id", "creatorId"])

export const FIELD_TYPES = Object.freeze([
    {value: "text"},
    {value: "checkbox"}
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
