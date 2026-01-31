import { useContext }  from 'react'

import * as Shared from './'

import '../../../css/components/pages/shared/ItemActions.css'

const ItemActions = ({ item }) => {

    const {
        userData,
        projects,
        setData,
        setDialog,
        rights
    } = useContext(Shared.AppContext)

    const parts = item?._id.split('.')
    const project = Shared.getItemById(projects, parts[0])
    const accessibleItem = (parts.length < 3)
        ? project.findItemWithParent(project.activities, "_id", parts[0] + '.' + parts[1], project).item
        : item
    
    const condition = (parts.length === 1)
    const buttonClass = (condition) ? "button-mini" : "button-mini button-tool"
    const wrapperClass = (condition) ? "" : "actions"
    
    return (
        <>
            {accessibleItem.getAccessType(rights.edit, userData) && (
            <div
                className={wrapperClass}
            >
                {(item?.deleted && accessibleItem.getAccessType(rights.fullView, userData)) ? (
                    <button
                        className={buttonClass}
                        onClick={(e) => {
                            e.stopPropagation()
                            item.deleteItem(false, projects, setData)
                        }}
                    >
                        ♻️
                    </button>
                ) : (
                    <>
                        {Shared.getDialogButton(
                            setDialog,
                            buttonClass,
                            "AddEditUserList",
                            [item._id],
                            "👥",
                            true
                        )}
                        {(parts?.length < 3) &&
                        Shared.getDialogButton(
                            setDialog,
                            buttonClass,
                            "AddEditItem",
                            [item, item._id],
                            "⚙️",
                            true
                        )}
                        <button
                            className={buttonClass}
                            onClick={(e) => {
                                e.stopPropagation()
                                item.deleteItem(true, projects, setData)
                            }}
                        >
                            🗑️
                        </button>
                    </>
                )}
                
            </div>
            )}
        </>
    )
}

export default ItemActions