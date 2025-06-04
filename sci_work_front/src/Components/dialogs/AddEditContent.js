import { useState } from 'react'
import '../../css/dialogs/AddEditContent.css'
import '../../css/dialogs/dialog.css'

import * as Shared from '../pages/sharedComponents'

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

    const activity = Shared.GetItemById(activities, containerId)
    const listStructure = activity.content?.liStructure || {}
    const listItems = activity.content?.listItems || []

    console.log("activity", activity, containerId)

    const [editType, setEditType] = useState({type: "Add item"})
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
        const { name, value, type, checked } = e.target
        setFormValues(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
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
        //structure can not be empty
        if (Object.keys(listStructure).length === 0) {
            newErrors["listStructure"] = 'empty'
        }
        // for (const key in listStructure) {
        //     const val = formValues[key]
        //     if (listStructure[key] === 'checkbox') continue
        //     if (typeof val === 'string' && val.trim() === '') {
        //         newErrors[key] = 'Required'
        //     }
        // }
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

        updatedActivity.content.liStructure = { ...structureFields }

        if (editType !== "Structure") {
            const newItem = {
                _id: activity._id + '.' + listItems.length,
                ...formValues
            }

            updatedActivity.content.listItems = [...listItems]
            updatedActivity.content.listItems.splice(itemIndex + 1, 0, newItem)

            itemIndex++
        }

        setData({
            action: "content",
            item: {
                type: "List",
                activity: updatedActivity
            }
        })
    }

    return (
        <div className="addEditContentDialog dialogContainer">
            <div className="dialogContent">
                <Shared.ToggleButton
                    data={editType}
                    setter={setEditType}
                    field={"type"}
                    displayOptions={['Structure', 'Add item']}
                />

                <form className="dialogForm">
                    {(editType.type === "Structure") ? (
                        <>
                            {Object.entries(structureFields).map(([key, type]) => (
                                <div key={key}>
                                    <label>
                                        {key}
                                        <select value={type} onChange={(e) => handleStructureChange(key, e.target.value)}>
                                            <option value="text">text</option>
                                            <option value="checkbox">checkbox</option>
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setStructureFields(prev => {
                                                    const updated = { ...prev }
                                                    delete updated[key]
                                                    return updated
                                                })
                                            }}
                                            className="deleteFieldBtn"
                                        >
                                            X
                                        </button>
                                    </label>
                                </div>
                            ))}
                            <div className="add-field-form">
                            <input
                                type="text"
                                placeholder="Field name"
                                value={newField.name}
                                onChange={e => setNewField(prev => ({ ...prev, name: e.target.value }))}
                            />
                            <select
                                value={newField.type}
                                onChange={e => setNewField(prev => ({ ...prev, type: e.target.value }))}
                            >
                                <option value="text">text</option>
                                <option value="checkbox">checkbox</option>
                            </select>
                            <button
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
                            if (type === 'checkbox') {
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
                            else {
                                return (
                                    <label key={key}>
                                        {key}
                                        <input
                                            type="text"
                                            name={key}
                                            value={formValues[key] || ""}
                                            onChange={handleInputChange}
                                        />
                                        {errors[key] && <span className="error">{errors[key]}</span>}
                                    </label>
                                )
                            }
                        })
                    )}
                </form>

                <div className="dialogButtons">
                    <button onClick={handleSubmit}>Save</button>
                    <button onClick={closeDialog}>Close</button>
                </div>
            </div>
        </div>
    )
}

export default AddEditContent