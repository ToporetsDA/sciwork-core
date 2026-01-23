// Libraries
import { useState, useRef, useEffect, useContext } from 'react'
// Styles, Classes, Constants
import '../../css/components/items/Text.css'
// Methods, Components
import * as Shared from '../pages/shared'

/* structure
{
    _id
    name
    template
    content: {
        currentSettings: {}
        [data]
    }
}
*/

const Text = ({
    item,
    data = "text"
}) => {

    const {
        userData,
        projects,
        activities,
        setData,
        state,
        rights
    } = useContext(Shared.AppContext)

    const parts = item._id.split('.')
    const activityId = parts[0] + '.' + parts[1]
    const activity = Shared.getItemById(activities, activityId)

    const project = Shared.getItemById(projects, state.currentProject)
    const { item: metaActivity } = project.findItemWithParent(project.activities, "_id", activity._id, project)

    const [isEditing, setIsEditing] = useState(false)
    const [savedHtml, setSavedHtml] = useState('')
    const editorRef = useRef(null)
    const toolbarRef = useRef(null)

    useEffect(() => {
        setSavedHtml(
            data.split('.').reduce((acc, key) => {
                const index = parseInt(key)
                return acc?.[isNaN(index) ? key : index]
            }, activity?.content)
        )
    }, [activity, data])

    useEffect(() => {
        if (isEditing && editorRef.current && toolbarRef.current) {
            const rect = editorRef.current.getBoundingClientRect()

            toolbarRef.current.style.top = `${rect.top - toolbarRef.current.offsetHeight - 8}px`
            toolbarRef.current.style.left = `${rect.left}px`
            toolbarRef.current.style.width = `${rect.width}px`

            toolbarRef.current.style.transform = 'none'
        }
    }, [isEditing])

    const exec = (cmd, value = null) => {
        document.execCommand(cmd, false, value)
    }

    const handleSave = () => {
        const newHtml = editorRef.current.innerHTML
        const updatedActivity = activity.setFieldValue(data, newHtml)

        setData({ action: "content", item: { type: "Text", activity: updatedActivity } })
        setIsEditing(false)
    }

    const handleBlur = (e) => {
        // Якщо натиснули поза тулбаром і текстом — зберігаємо
        setTimeout(() => {
            if (!editorRef.current.contains(document.activeElement) &&
                !toolbarRef.current.contains(document.activeElement)) {
                handleSave()
            }
        }, 100)
    }

    const handleEditorClick = () => {
        console.log("open toolbar to edit text")
        if (!isEditing) {
            setIsEditing(true)
            // Додатково встановити фокус у редактор
            setTimeout(() => {
                if (editorRef.current) {
                    editorRef.current.focus()
                }
            }, 0)
        }
    }

    const itemToEdit = (metaActivity?.userData) ? metaActivity : project

    return (
        (rights.edit.includes(itemToEdit.getAccess(userData))) ? (
            <div className='text-wrapper' style={{ position: 'relative' }}>
                {isEditing && (
                    <div ref={toolbarRef} className="toolbar-popup">
                        <button onMouseDown={(e) => { e.preventDefault(); exec('bold') }}><b>B</b></button>
                        <button onMouseDown={(e) => { e.preventDefault(); exec('italic') }}><i>I</i></button>
                        <button onMouseDown={(e) => { e.preventDefault(); exec('underline') }}><u>U</u></button>
                        <select onChange={(e) => exec('fontSize', e.target.value)} defaultValue="3">
                            <option value="3">Normal</option>
                            <option value="4">Large</option>
                            <option value="5">Larger</option>
                        </select>
                        <input type="color" onChange={(e) => exec('foreColor', e.target.value)} />
                    </div>
                )}
                <div
                    ref={editorRef}
                    className='editor-area'
                    contentEditable={isEditing}
                    onClick={handleEditorClick}
                    onBlur={handleBlur}
                    dangerouslySetInnerHTML={{ __html: savedHtml }}
                    suppressContentEditableWarning={true}
                />
            </div>
        ) : (
            <div className='text-wrapper'>
                <div className='text-container'>
                    <div
                        dangerouslySetInnerHTML={{
                            __html: data.split('.').reduce((acc, key) => {
                                const index = parseInt(key)
                                return acc?.[isNaN(index) ? key : index]
                            }, activity?.content) || ''
                        }}
                    />
                </div>
            </div>
        )
        
    )
}

export default Text
