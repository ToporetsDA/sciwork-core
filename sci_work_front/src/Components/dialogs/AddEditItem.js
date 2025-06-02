import { useState, useMemo }  from 'react'
import '../../css/dialogs/AddEditItem.css'
import '../../css/dialogs/dialog.css'

import { ObjectId } from 'bson'

import * as Shared from '../pages/sharedComponents'

const AddEditItem = ({
    userData, setUserData,
    projects,
    activities,
    setData,
    state, setState,
    rights,
    itemStructure,
    defaultStructure,
    isCompany
}) => {

    const currentItem = state.currentDialog.params[0]
    const currentItemId = state.currentDialog.params[1]
    const activityIndex = state.currentDialog.params[2]
    const containerId = state.currentDialog.params[3]

    const selectedType = state.currentProject ? "Activity" : "Project"

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
                acc[key] = currentItem[key] !== undefined ? currentItem[key] : defaultValues[key] || (structure[key] === 'checkbox' ? false : '') // Fallback to default if missing
                return acc
            }, {})
        }
        return {} // Return empty object if currentItem is undefined
    }

    const [formValues, setFormValues] = useState(() => {
        return initializeFormValues(defaultStructure[selectedType.toLowerCase()], itemStructure[selectedType.toLowerCase()])
    })

    // Reset form values for the new type

    const handleInputChange = (e) => {
        const { name, type, checked, value } = e.target
        setFormValues((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
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

    //show item-fields
    const showItemFields = useMemo(() => {
        const isSchedule = state.currentPage === 'Schedule'
        const project = Shared.GetItemById(projects, state.currentProject)
        const itemWithUserList = (state.currentProject)
            ? Shared.FindItemWithParent(project.activities, "_id", currentItemId, project)?.item
            : Shared.GetItemById(projects, currentItemId)
            
        let canEdit = userData.genStatus
        //edit
        if (itemWithUserList?._id) {
            canEdit = itemWithUserList.userList.find(user => user.id === userData._id)?.access
        }
        //add
        else if (containerId && currentItemId) {
            const item = (!containerId.includes('.'))
                ? Shared.GetItemById(projects, containerId)
                : Shared.FindItemWithParent(project.activities, "_id", currentItemId, project).item
            
            canEdit = item.userList.find(user => user.id === userData._id)?.access
        }
        
        return (
            !isSchedule
            && (
                (selectedType === 'Project')
                || (selectedType === 'Activity' && state.currentProject)
            )
            && (rights.edit.includes(canEdit))
        )
    }, [userData, projects, state, selectedType, currentItemId, containerId, rights.edit])

    //conditions for fields that should appear based on other fields values
    const fieldConditionCheck = (key) => {
        const check = itemStructure.checks?.[key]
        if (!check) return true // no condition => always show
        return formValues[check.dep] === check.val
    }

    // Close the dialog

    const closeDialog = () => {
        setState((prevState) => ({
            ...prevState,
            currentDialog: {
                name: undefined,
                params: []
            }
        }))
    }

    //save changes

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
        if (formValues.startDate && formValues.endDate) {

            const startDate = new Date(formValues.startDate)
            const endDate = new Date(formValues.endDate)

            if (startDate > endDate) {
                if ((startDate === endDate && selectedType === 'Project') || selectedType === 'Activity') {
                    errors.startDate = 'Start date must be before end date.'
                }
            }

            if (endDate < new Date()) {
                errors.endDate = 'Trying to create expired project'
            }

            if (selectedType === 'Activity') {
                const project = Shared.GetItemById(projects, Shared.GetItemById(projects, state.currentProject))
                
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

    const formatFormValues = (values) => {
        const formatted = {}

        for (const key in values) {
            const value = values[key]
            console.log("itemStructure", itemStructure)
            const field = itemStructure.lists[key]

            if (!field) {
                formatted[key] = value
                continue
            }

            if (field.many === false && Array.isArray(value)) {
                formatted[key] = value[0] ?? null
            }
            else {
                formatted[key] = value
            }
        }

        return formatted
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

        const project = Shared.GetItemById(projects, state.currentProject)
        const formattedFormValues = formatFormValues(formValues)

        let newItem = {
            ...formattedFormValues,
            _id: currentItemId
                ? currentItemId
                : selectedType === "Project"
                    ? new ObjectId().toHexString()
                    : project._id + '.' + project.dndCount,
            activities: [],
            userList: [{
                id: userData._id,
                access: 0
            }],
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
                const { parent: container } = Shared.FindItemWithParent(project.activities, "_id", currentItemId, project)
                
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

    const formatLabel = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())

    const currentStructure = itemStructure[selectedType.toLowerCase()]

    return (
        <div className="addEditItemDialog dialogContainer">
            <div className="dialogContent">
                <h2>{currentItem === true 
                    ? (state.currentProject ? 'Add new Activity' : 'Add New Project')
                    : `Edit: ${currentItem.name}`}

                </h2>
                <form onSubmit={handleSubmit}>
                    {(showItemFields) && (
                        Object.keys(currentStructure).map((key) => (
                            <div key={key} className="formGroup">
                                {(currentStructure[key] === "list") ? (
                                    fieldConditionCheck(key) &&
                                    <div className='listFieldBox'>
                                        <label htmlFor={key}>{formatLabel(key)}</label>
                                        <div className={`fieldBox listButtons`}>
                                            {itemStructure.lists[key].options.map((val) => (
                                                <button
                                                    key={val}
                                                    type="button"
                                                    className={formValues[key]?.includes(val) ? 'selected' : ''}
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
                                        className={`fieldBox ${currentStructure[key] === 'checkbox' && 'checkboxFieldBox'}`}
                                    >
                                        <label htmlFor={key}>{formatLabel(key)}</label>
                                        <input
                                        id={key}
                                        name={key}
                                        type={currentStructure[key]}
                                        value={formValues[key] || ''}
                                        checked={currentStructure[key] === 'checkbox' ? formValues[key] : undefined}
                                        onChange={handleInputChange}
                                        />
                                    </div>
                                    }
                                </>
                                )}
                                {errors[key] && <span className="errorMessage">{errors[key]}</span>}
                            </div>
                        ))
                    )}
                    <button type="button" className="actionButton" onClick={closeDialog}>Cancel</button>
                    <button type="submit" className="actionButton">Save</button>
                </form>
            </div>
        </div>
    )
}

export default AddEditItem