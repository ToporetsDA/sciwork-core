import React, { useRef, useState } from 'react'
import '../../css/Items/Group.css'

import * as Shared from '../pages/sharedComponents'
import * as Items from './'

const Text = ({userData, data, setData, activities, setActivities, state, setState, item, index, rights, recentActivities, setRecentActivities}) => {
    const editorRef = useRef(null)
    const [editing, setEditing] = useState(false)
    const [savedHtml, setSavedHtml] = useState(item.content?.html || '')

    const exec = (cmd, value = null) => {
        document.execCommand(cmd, false, value)
    }

    const handleSave = () => {
        const newHtml = editorRef.current.innerHTML
        setSavedHtml(newHtml)
        setEditing(false)

        setActivities(prev => prev.map(act =>
            act._id === item._id ? { ...act, content: { ...act.content, html: newHtml } } : act
        ))

        // Optionally: send to server
        // sendToServer(item._id, newHtml)
    }

    return (
        <div className="text-editor">
            {editing ? (
                <>
                    <div className="toolbar">
                        <button onClick={() => exec('bold')}><b>B</b></button>
                        <button onClick={() => exec('italic')}><i>I</i></button>
                        <select onChange={(e) => exec('fontSize', e.target.value)}>
                            <option value="3">Normal</option>
                            <option value="4">Large</option>
                            <option value="5">Larger</option>
                        </select>
                        <input type="color" onChange={(e) => exec('foreColor', e.target.value)} />
                    </div>

                    <div
                        ref={editorRef}
                        contentEditable
                        dangerouslySetInnerHTML={{ __html: savedHtml }}
                        style={{
                            border: '1px solid #ccc',
                            padding: '10px',
                            minHeight: '150px',
                            marginBottom: '10px',
                            backgroundColor: '#fff',
                        }}
                    />
                    <button onClick={handleSave}>Save</button>
                </>
            ) : (
                <>
                    <div
                        dangerouslySetInnerHTML={{ __html: savedHtml }}
                        style={{ border: '1px solid #ddd', padding: '10px', minHeight: '150px', cursor: 'text' }}
                        onClick={() => setEditing(true)}
                    />
                </>
            )}
        </div>
    )
}

export default Text
