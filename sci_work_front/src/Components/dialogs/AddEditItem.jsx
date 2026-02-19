import { useState, useMemo, useContext }  from 'react'
import { ObjectId } from 'bson'

import '../../Styles/components/dialogs/AddEditContent.sass'

import { getInput, getItemById, toUTC, formatFormValues } from '../../lib/helpers'

import { AppContext } from '../pageAssets/shared'

const AddEditItem = () => {

    const { //can not apply url-based itemIds in dialogs
        currentPage,
        projectId,
        userData,
        functionalSettings,
        projects,
        setData,
        dialog, setDialog,
        rights,
        itemStructure,
        defaultStructure,
        useLocale
    } = useContext(AppContext)

    const { t } = useLocale("dialogs.addEditItem")

    // ==================================
    // const, helpers and state management
    // ==================================

    const currentItem = dialog.params[0]
    const currentItemId = dialog.params[1]
    const activityIndex = dialog.params[2]
    const containerId = dialog.params[3]

    const selectedType = projectId ? "Activity" : "Project"

    const currentStructure = itemStructure[selectedType.toLowerCase()]

    const [formValues, setFormValues] = useState(() => {
        return initializeFormValues(defaultStructure[selectedType.toLowerCase()], itemStructure[selectedType.toLowerCase()])
    })

    // --- helpers ---

    const formatLabel = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())

    const unformatLabel = (label) => {
        return label
            .replace(/ ([a-zA-Z])/g, (_, c) => c.toUpperCase())
            .replace(/ /g, '')
            .replace(/^./, (c) => c.toLowerCase())
    }

    // ==================================
    // item logic management
    // ==================================

    const [errors, setErrors] = useState({})

    const validation = () => {

        const errors = {}

        //empty check
        Object.keys(formValues).forEach((key) => {
            if (formValues[key] === '' && itemStructure[key] !== 'checkbox' && itemStructure[key] !== 'list' && fieldConditionCheck(key)) {
                errors[key] = 'This field is required.'
            }
            if (formValues[key].length === 0 && itemStructure[key] === 'list') {
                errors[key] = 'Select an option(s).'
            }
        })

        //name check
        if (formValues.name.length < 3) {
            errors.name = 'Too short'
        }

        //date checks
        if (formValues.startDate && formValues.endDate && !currentItemId) {

            const startDate = toUTC(new Date(formValues.startDate), functionalSettings.timeZone)
            const endDate = toUTC(new Date(formValues.endDate), functionalSettings.timeZone)

            if (startDate > endDate) {
                if ((startDate === endDate && selectedType === 'Project') || selectedType === 'Activity') {
                    errors.startDate = 'Start date must be before end date.'
                }
            }

            if (endDate < new Date()) {
                errors.endDate = 'Trying to create expired item'
            }

            if (selectedType === 'Activity') {
                const project = getItemById(projects, getItemById(projects, projectId))
                
                if (startDate < project.startDate || startDate >= project.endDate) {
                    errors.startDate = "Start date must be within project's lifetime."
                }

                if (endDate < project.startDate || endDate > project.endDate) {
                    errors.startDate = "End date must be within project's lifetime."
                }
            }
        }

        //time check
        if (formValues.startDate && formValues.endDate && formValues.isTimed && formValues.startTime && formValues.endTime) {
            const startDate = new Date(formValues.startDate)
            const endDate = new Date(formValues.endDate)

            const [startHour, startMinute] = formValues.startTime.split(':').map(Number)
            const [endHour, endMinute] = formValues.endTime.split(':').map(Number)
        
            const startInMinutes = startHour * 60 + startMinute
            const endInMinutes = endHour * 60 + endMinute

            if(startDate === endDate && startInMinutes > endInMinutes) {
                errors.startTime = "Activity can not start after it has ended"
            }
        
            if (startDate === endDate && startInMinutes + 15 >= endInMinutes) {
                errors.endTime = "Activity must exist at least 15 minutes."
            }
        }

        //repeat check
        if (formValues.repeat === true && formValues.days.length === 0) {
            errors.repeat = "Select at least 1 day to repeat the activity."
        }

        return errors
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        //validation
        const errors = validation()
        if (Object.keys(errors).length > 0) {
            setErrors(errors)
            alert('Please fix the errors before saving.')
            return
        }

        const project = getItemById(projects, projectId)
        const formattedFormValues = formatFormValues(formValues, functionalSettings, "toDomain")

        const { item: parent } = project.findItemWithParent(project?.activities || [], "_id", containerId, project)

        let newItem = {
            ...formattedFormValues,
            _id: currentItemId
                ? currentItemId
                : selectedType === "Project"
                    ? new ObjectId().toHexString()
                    : project._id + '.' + project.dndCount,
            activities: [],
            userList: (selectedType === "Project" || !parent?.userList)
                ? [{
                    id: userData._id,
                    access: 0
                }]
                : parent.userList,
            ...(selectedType === "Project"
                ? { dndCount: 0 }
                : { dnd: project.dndCount })
        }

        // submit

        let item
        const action = currentItemId ? "edit" : "add"
        
        if (selectedType === "Project") {
            //edit
            if (currentItemId) {
                item = { ...currentItem, ...formattedFormValues }
            }
            //add
            else {
                item = newItem
            }
        }
        else if (selectedType === "Activity") {
            //edit
            if (currentItemId) {
                const { parent: container } = project.findItemWithParent(project.activities, "_id", currentItemId, project)
                
                const target = container.activities.find(act => act._id === currentItemId)
                if (target) {
                    Object.assign(target, formattedFormValues)
                }
                
                item = {
                    ...target,
                    ...formattedFormValues
                }
            }
            //add
            else {
                item = {
                    _id: newItem._id,
                    containerId,
                    index: activityIndex,
                    activity: newItem
                }
            }
        }
        setData({ action, item })
        closeDialog()
    }

    // ==================================
    // form logic management
    // ==================================

    // Initialize form values based on default type

    const initializeFormValues = (defaultValues, structure) => {
        if (currentItem === true) {
            // If currentItem is 'true', return default values for a new item
            return Object.keys(defaultValues).reduce((acc, key) => {
                acc[key] = defaultValues[key] || (structure[key] === 'checkbox' ? false : '') // Fallback to empty string if no default
                return acc
            }, {})
        } else if (currentItem !== undefined) {
            // If currentItem is an object, fill with its values
            return Object.keys(defaultValues).reduce((acc, key) => {
                acc[key] = (currentItem[key] !== undefined)
                    ? currentItem[key]
                    : defaultValues[key]
                        || (structure[key] === 'checkbox' ? false : '') // Fallback to default if missing
                return acc
            }, {})
        }
        return {} // Return empty object if currentItem is undefined
    }

    // Reset form values for the new type

    const handleInputChange = (e) => {
        const { name, type, checked, value } = e.target
        setFormValues((prev) => ({
            ...prev,
            [unformatLabel(name)]: type === 'checkbox' ? checked : value
        }))
    }

    // Update set of selected days
    const toggleListSelection = (field, value, many) => {
        setFormValues((prev) => {

            const currentList = [...prev[field]] || []
            const baseList = many ? currentList : currentList.filter((v) => v === value)
            const updatedList = baseList.includes(value)
                ? baseList.filter((v) => v !== value)
                : [...baseList, value]
            
            return {
            ...prev,
            [field]: updatedList
            }
        })
    }

    // ==================================
    // form display management
    // ==================================

    //show item-fields
    const showItemFields = useMemo(() => {
        const isSchedule = currentPage === 'Schedule'
        const project = getItemById(projects, projectId)
        const itemWithUserList = (projectId)
            ? project.findItemWithParent(project.activities, "_id", currentItemId)?.item
            : getItemById(projects, currentItemId)
            
        let canEdit = userData.genStatus
        //edit
        if (itemWithUserList?._id) {
            canEdit = itemWithUserList.userList.find(user => user.id === userData._id)?.access
        }
        //add
        else if (containerId && currentItemId) {
            const item = (!containerId.includes('.'))
                ? getItemById(projects, containerId)
                : project.findItemWithParent(project.activities, "_id", currentItemId, project).item
            
            canEdit = item.userList.find(user => user.id === userData._id)?.access
        }
        
        return (
            !isSchedule
            && (
                (selectedType === 'Project')
                || (selectedType === 'Activity' && projectId)
            )
            && (rights.edit.includes(canEdit))
        )
    }, [userData, projects, currentPage, projectId, selectedType, currentItemId, containerId, rights.edit])

    //conditions for fields that should appear based on other fields values
    const fieldConditionCheck = (key) => {
        const check = itemStructure.checks?.[key]
        if (!check) {  // no condition => always show
            return true
        }
        return formValues[check.dep] === check.val
    }

    // ==================================
    // dialog logic
    // ==================================

    const closeDialog = () => {
        setDialog({
            name: undefined,
            params: []
        })
    }

    const disableTypes = (type) => {
        switch(type) {
            case "Group": {
                if (containerId && containerId.includes('.')) {
                    return true
                }
                break
            }
            default: {}
        }
        return false
    }

    // ==================================

    return (
        <div className="add-edit-item-dialog dialog-container">
            <div className="dialog-content">
                <h2>
                    {
                        currentItem === true 
                            ? (projectId ? t("type.activity") : t("type.project"))
                            : t("type.edit", { name: currentItem.name })
                    }
                </h2>
                <form onSubmit={handleSubmit}>
                    {(showItemFields) && (
                        Object.keys(currentStructure).map((key) => (
                            <div key={key} className="form-group">
                                {(currentStructure[key] === "list") ? (
                                    fieldConditionCheck(key) &&
                                    <div className='list-field-box'>
                                        <label htmlFor={key}>{formatLabel(key)}</label>
                                        <div className={`field-box list-buttons`}>
                                            {itemStructure.lists[key].options.map((val) => (
                                                <button
                                                    key={val}
                                                    type="button"
                                                    disabled={disableTypes(val)}
                                                    className={`button-from-list ${formValues[key]?.includes(val) ? 'selected' : ''}`}
                                                    onClick={() => toggleListSelection(key, val, itemStructure.lists[key].many)}
                                                >
                                                    {val}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                <>
                                    {fieldConditionCheck(key) &&
                                    <div
                                        className={`field-box ${currentStructure[key] === 'checkbox' && 'checkbox-field-box'}`}
                                    >
                                        {getInput(
                                            formatLabel(key),
                                            currentStructure[key],
                                            currentStructure[key] !== 'checkbox' ? formValues[key] : undefined,
                                            currentStructure[key] === 'checkbox' ? formValues[key] : false,
                                            handleInputChange,
                                            false,
                                            null,
                                            60,

                                        )}
                                    </div>
                                    }
                                </>
                                )}
                                {errors[key] && <span className="error-message">{errors[key]}</span>}
                            </div>
                        ))
                    )}
                    <button type="submit" className="button-main">
                        {t("actions.save")}
                    </button>
                    <button type="button" className="button-main" onClick={closeDialog}>
                        {t("actions.back")}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default AddEditItem