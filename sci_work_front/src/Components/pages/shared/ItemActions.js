import { useContext }  from 'react'

import * as Shared from './'

import '../../../css/components/pages/shared/ItemActions.css'

const ItemActions = ({ item }) => {

    const {
        userData,
        projects,
        setData,
        setState,
        rights
    } = useContext(Shared.AppContext)

    const parts = item?._id.split('.')
    const project = Shared.getItemById(projects, parts[0])
    const accessibleItem = (parts.length < 3)
        ? item
        : project.findItemWithParent(project.activities, "_id", parts[0] + '.' + parts[1], project).item
    
    const condition = (parts.length === 1)
    const buttonClass = (condition) ? "button-mini" : "button-mini button-tool"
    const wrapperClass = (condition) ? "" : "actions"

    const getAccess = (rights, type, accessibleItem, userData) => {
        return rights[type].includes(accessibleItem.getAccess(accessibleItem, userData))
    }
    
    return (
        <>
            {getAccess(rights, "edit", accessibleItem, userData) && (
            <div
                className={wrapperClass}
            >
                {(item?.deleted && getAccess(rights, "fullView", accessibleItem, userData)) ? (
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
                            setState,
                            buttonClass,
                            "AddEditUserList",
                            [item._id],
                            "👥",
                            true
                        )}
                        {(parts?.length < 3) &&
                        Shared.getDialogButton(
                            setState,
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