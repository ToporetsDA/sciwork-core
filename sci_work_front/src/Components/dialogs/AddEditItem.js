import { useState, useMemo }  from 'react'
import '../../css/dialogs/AddEditItem.css'
import '../../css/dialogs/dialog.css'

import * as Shared from '../pages/sharedComponents'

const AddEditItem = ({ userData, setUserData, data, setData, state, setState, rights, itemStructure, defaultStructure, isCompany }) => {

    const currentItem = state.currentDialog.params[0]
    const currentItemId = state.currentDialog.params[1] || false
    const selectedType = ["Activity", "Project"].includes(state.currentPage) ? state.currentPage : "Project"

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
            const currentList = prev[field] || []
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
        return (state.currentPage !== 'Schedule' || selectedType === 'Project' ||
        (selectedType === 'Activity' && state.currentProject !== undefined)) &&
        ((state.currentProject !== undefined) ? rights.edit.includes(Shared.GetItemById(data, state.currentProject).access) : true)
    }, [data, state, selectedType, rights.edit])

    //conditions for fields that should appear based on other fields values
    const fieldsChecks = useMemo(() => {
        return {
            days: (formValues?.repeat === true) || false,
            serviceName: (formValues?.thirdParty === true) || false
        }
    }, [formValues])

    // Close the dialog

    const [errors, setErrors] = useState({})

    const validation = () => {

        const errors = {}

        //empty check
        Object.keys(formValues).forEach((key) => {
            if (formValues[key] === '' && itemStructure[key] !== 'checkbox' && itemStructure[key] !== 'list' && fieldsChecks[key] === true) {
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
                const project = Shared.GetItemById(data, Shared.GetItemById(data, state.currentProject))
                
                if (startDate < project.startDate || startDate >= project.endDate) {
                    errors.startDate = "Start date must be within project's lifetime."
                }

                if (endDate < project.startDate || endDate > project.endDate) {
                    errors.startDate = "End date must be within project's lifetime."
                }
            }
        }

        //time check
        if (formValues.startDate && formValues.endDate && formValues.startTime && formValues.endTime) {
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

        const project = Shared.GetItemById(data, state.currentProject)

        let newItem = {
            ...formValues,
            ...(state.currentProject !== undefined && {
                _id: currentItemId ? currentItemId : Math.random().toString(36).slice(2, 10)
            }),
            activities: [],
            userList: [{
                id: userData._id,
                access: 0
            }],
            ...(selectedType === "Project"
                ? { dndCount: 0 }
                : { dnd: project.dndCount })
        }

        if (selectedType !== "Project") {
            project.dndCount += 1
        }

        console.log(newItem)

        // submit

        let action = "edit"
        let item

        const isActivity = selectedType === "Activity" && state.currentProject !== undefined
        
        if (isActivity) {
            const { parent: container } = Shared.FindItemWithParent(project.activities, "_id", currentItemId, project)
            if (!container.activities) container.activities = []
            container.activities.push(newItem)
            Shared.NormalizeItemIds(container)
        } else {
            const existingItem = data.find((item) => item._id === currentItem._id)
            if (existingItem) {
                item = { ...existingItem, ...formValues }
            }
            else {
                action = "add"
                item = newItem
            }
        }

        setData({ action, item })
        setState((prevState) => ({
            ...prevState,
            currentProject: ((isActivity === true) ? item : project),
            currentDialog: {
                name: undefined,
                params: []
            }
        }))
    }

    const handleOutsideClick = (e) => {
        if (e.target === e.currentTarget) {
            setState((prevState) => ({
                ...prevState,
                currentDialog: {
                    name: undefined,
                    params: []
                }
            }))
        }
    }

    const formatLabel = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())

    const currentStructure = itemStructure[selectedType.toLowerCase()]

    return (
        <div className="addEditItemDialog dialogContainer" onClick={handleOutsideClick}>
            <div className="dialogContent">
                <h2>{currentItem === true 
                    ? (state.currentProject ? 'Add new Activity' : 'Add New Project')
                    : `Edit: ${currentItem.name}`}

                </h2>
                <form onSubmit={handleSubmit}>
                    {currentItem === true && state.currentPage === 'Schedule' &&
                    <>
                        {/* {selectedType === 'Activity' &&
                            <select
                                id="projectList"
                                value={Shared.GetItemById(data, state.currentProject)?._id || ""}
                                onChange={(e) => {
                                    const selectedProject = Shared.GetItemById(data, e.target.value)
                                    if (selectedProject) {
                                        setState((prevState) => ({
                                            ...prevState,
                                            currentProject: selectedProject,
                                        }))
                                    }
                                }}
                            >
                                <option value="" disabled>
                                    Select a Project
                                </option>
                                {data.map((project) => (
                                    <option key={project._id} value={project._id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                        } */}
                    </>
                    }
                    {(showItemFields) && (
                        Object.keys(currentStructure).map((key) => (
                            <div key={key} className="formGroup">
                                {(currentStructure[key] === "list") ? (
                                fieldsChecks.days &&
                                    <>
                                        <label htmlFor={key}>{formatLabel(key)}</label>
                                        <div className="daysButtons">
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
                                    </>
                                ) : (
                                <>
                                    {((key === 'serviceName' && fieldsChecks.serviceName) || key !== 'serviceName') &&
                                    <>
                                        <label htmlFor={key}>{formatLabel(key)}</label>
                                        <input
                                        id={key}
                                        name={key}
                                        type={currentStructure[key]}
                                        value={formValues[key] || ''}
                                        checked={currentStructure[key] === 'checkbox' ? formValues[key] : undefined}
                                        onChange={handleInputChange}
                                        />
                                    </>
                                    }
                                </>
                                )}
                                {errors[key] && <span className="errorMessage">{errors[key]}</span>}
                            </div>
                        ))
                    )}
                    <button type="submit" className="submitButton">Save</button>
                </form>
            </div>
        </div>
    )
}

export default AddEditItem