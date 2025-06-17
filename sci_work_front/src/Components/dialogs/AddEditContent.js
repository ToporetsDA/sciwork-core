import { useState } from 'react'
import '../../css/components/dialogs/AddEditContent.css'

import * as Shared from '../pages/shared'

const AddEditContent = ({
    userData, setUserData,
    projects,
    activities,
    setData,
    state, setState,
    rights,
    isCompany
}) => {

    let itemIndex = state.currentDialog.params[2]
    const containerId = state.currentDialog.params[3]
    const editType =  state.currentDialog.params[4]

    const activity = Shared.getItemById(activities, containerId)
    const listStructure = activity.content?.liStructure || {}
    const listItems = activity.content?.listItems || []

    const [newField, setNewField] = useState({ name: '', type: 'text' })

    const [formValues, setFormValues] = useState(() =>
        Object.keys(listStructure).reduce((acc, key) => {
            acc[key] = listStructure[key] === 'checkbox' ? false : ''
            return acc
        }, {})
    )

    const [structureFields, setStructureFields] = useState(() => ({ ...listStructure }))

    const [errors, setErrors] = useState({})

    //handle dialog behaviors

    const closeDialog = () => {
        setState(prev => ({
            ...prev,
            currentDialog: { name: undefined, params: [] }
        }))
    }

    const handleInputChange = (e) => {
        const { name, value, type, checked, dataset } = e.target
        const section = dataset.section

        console.log("updating form values", name, value, type, checked, section)

        if (section === "markable") {
            setFormValues((prev) => ({
            ...prev,
            markable: {
                ...prev.markable,
                [name]: value,
            },
            }))
        } else {
            setFormValues((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
            }))
        }
    }

    const handleStructureChange = (key, type) => {
        setStructureFields(prev => ({
            ...prev,
            [key]: type
        }))
    }

    //check special conditions. Will be added later
    const validate = () => {
        const newErrors = {}

        // 1. List structure must not be empty
        if (Object.keys(listStructure).length === 0) {
            newErrors["listStructure"] = 'empty'
        }

        // 2. If markable is enabled, perform checks
        if (activity.content?.currentSettings?.markable) {
            const { date, startTime, endTime } = formValues.markable || {}

            // A. Check if start time is after end time
            if (startTime && endTime) {
                const start = new Date(`2000-01-01T${startTime}`)
                const end = new Date(`2000-01-01T${endTime}`)
                if (start >= end) {
                    newErrors["markableTime"] = "Start time must be before end time"
                }
            }

            // B. Check if date is in the past (compared to today)
            if (date) {
                const today = new Date()
                const inputDate = new Date(date)
                today.setHours(0, 0, 0, 0) // Strip time from today
                inputDate.setHours(0, 0, 0, 0) // Strip time from input date

                if (inputDate < today) {
                    newErrors["markableDate"] = "Date cannot be in the past"
                }
            }
        }

        return newErrors
    }

    const handleSubmit = () => {

        const errors = validate()
        if (Object.keys(errors).length > 0) {
            setErrors(errors)
            alert('Please fix the errors before saving.')
            return
        }

        const updatedActivity = { ...activity }

        if (!editType.includes("Structure")) {
            let newItem = {
                ...formValues,
                _id: activity._id + '.' + listItems.length,
                creatorId: userData._id,
                userList: [{
                    id: userData._id,
                    access: 0
                }]
            }

            if (activity.content?.currentSettings?.markable) {
                newItem.markable.userEntries = []
            }

            updatedActivity.content.listItems = [...listItems]
            updatedActivity.content.listItems.splice(itemIndex + 1, 0, newItem)

            itemIndex++
        }
        else {
            updatedActivity.content.liStructure = { ...structureFields }
            console.log("I updated structure")
        }

        console.log("updatedActivity", updatedActivity)
        setData({
            action: "content",
            item: {
                type: "List",
                activity: updatedActivity
            }
        })
    }

    return (
        <div className="dialog-container">
            <div className="dialog-content">
                <form className="add-edit-content-dialog-form">
                    {(editType.includes("Structure")) ? (
                        <>
                            {Object.entries(structureFields).map(([key, type]) => (
                                <div key={key}>
                                    {key !== "markable" &&
                                    <div
                                        className='field'
                                    >
                                        <p>{key}</p>
                                        {Shared.getSelect(
                                            type,
                                            (e) => handleStructureChange(key, e.target.value),
                                            [{value: "text"},{value: "checkbox"}],
                                            "value",
                                            "value",
                                            "value"
                                        )}
                                        <button
                                            className="button-mini"
                                            type="button"
                                            onClick={() => {
                                                setStructureFields(prev => {
                                                    const updated = { ...prev }
                                                    delete updated[key]
                                                    return updated
                                                })
                                            }}
                                        >
                                            X
                                        </button>
                                    </div>
                                    }
                                </div>
                            ))}
                            <div className="add-field-form">
                                {Shared.getInput(
                                    "Field name",
                                    "text",
                                    newField.name,
                                    undefined,
                                    e => setNewField(prev => ({ ...prev, name: e.target.value })),
                                    false,
                                    null,
                                    50
                                )}
                                {Shared.getSelect(
                                    newField.type,
                                    (e) => setNewField(prev => ({ ...prev, type: e.target.value })),
                                    [{value: "text"},{value: "checkbox"}],
                                    "value",
                                    "value",
                                    "value"
                                )}
                                <button
                                    className="button-mini"
                                    type="button"
                                    onClick={() => {
                                        const { name, type } = newField
                                        if (name && !(name in structureFields)) {
                                            setStructureFields(prev => ({
                                                ...prev,
                                                [name]: type
                                            }))
                                            setNewField({ name: '', type: 'text' })
                                        }
                                    }}
                                >
                                    Add
                                </button>
                            </div>
                            {/* <p className='warning'>WARNING: deletion of a field will erase it from existing entries!</p> */}
                        </>
                    ) : (
                        Object.entries(structureFields).map(([key, type]) => {
                            switch(type) {
                                case "text": {
                                    return (
                                        <label key={key}>
                                            {Shared.getInput(
                                                key,
                                                "text",
                                                formValues[key] || "",
                                                false,
                                                handleInputChange,
                                                false,
                                                null,
                                                50
                                            )}
                                            {errors[key] && <span className="error">{errors[key]}</span>}
                                        </label>
                                    )
                                }
                                case "checkbox": {
                                    return (
                                        <label key={key}>
                                            <input
                                                type="checkbox"
                                                name={key}
                                                checked={formValues[key] || false}
                                                onChange={handleInputChange}
                                            />
                                            {key}
                                        </label>
                                    )
                                }
                                case "markable": {
                                    return (
                                        <div key={key} className="markable-wrapper">
                                            <label><strong>{key}</strong></label>
                                            <div>
                                                <label>
                                                    {Shared.getInput(
                                                        "date",
                                                        "date",
                                                        formValues.markable?.date || "",
                                                        false,
                                                        handleInputChange,
                                                        false,
                                                        "markable",
                                                        50
                                                    )}
                                                </label>
                                                <label>
                                                    {Shared.getInput(
                                                        "startTime",
                                                        "time",
                                                        formValues.markable?.startTime || "",
                                                        false,
                                                        handleInputChange,
                                                        false,
                                                        "markable",
                                                        50
                                                    )}
                                                </label>
                                                <label>
                                                    {Shared.getInput(
                                                        "endTime",
                                                        "time",
                                                        formValues.markable?.endTime || "",
                                                        false,
                                                        handleInputChange,
                                                        false,
                                                        "markable",
                                                        50
                                                    )}
                                                </label>
                                            </div>
                                        </div>
                                    )
                                }
                                default: {
                                    return (
                                    <div key={key}></div>
                                    )
                                }
                            }
                        })
                    )}
                </form>

                <div className="dialog-actions">
                    <button
                        className='button-main'
                        onClick={handleSubmit}
                    >
                        Save
                    </button>
                    <button
                        className='button-main'
                        onClick={closeDialog}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AddEditContent