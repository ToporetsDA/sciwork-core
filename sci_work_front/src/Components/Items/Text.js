import React, { useRef, useState } from 'react'
import '../../css/Items/Text.css'

import * as Shared from '../pages/sharedComponents'
import * as Items from './'

const Text = ({
    userData,
    projects,
    activities,
    setData,
    state, setState,
    item,
    data,
    rights,
}) => {

    const activity = Shared.GetItemById(activities, item._id)

    const handleEdit = (field) => {
        setState((prevState) => ({
            ...prevState,
            currentDialog: {
                name: 'AddEditContent',
                params: [item._id, "Text", field]}
        }))
    }

    return (
        <div className='text-wrapper'>
            <div className='text-container'>
                <div dangerouslySetInnerHTML={{ __html: activity?.content?.[data] || '' }} />
            </div>
            <button
                className="gearButton"
                onClick={() => handleEdit(data)}
                >
                ⚙️
                </button>
        </div>
    )
}

export default Text
