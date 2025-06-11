import * as Shared from './'

import '../../../css/components/pages/sharedComponents/ItemActions.css'

const ItemActions = ({userData, projects, setData, setState, item, rights}) => {

    const parts = item?._id.split('.')
    const project = Shared.GetItemById(projects, parts[0])
    const accessibleItem = (parts.length < 3)
        ? item
        : Shared.FindItemWithParent(project.activities, "_id", parts[0] + '.' + parts[1], project).item
    
    const condition = (parts.length === 1)
    const buttonClass = (condition) ? "button-mini" : "button-mini button-tool"
    const wrapperClass = (condition) ? "" : "actions"
    
    return (
        <>
            {!item.deleted && rights.edit.includes(Shared.GetAccess(accessibleItem, userData)) && (
            <div
                className={wrapperClass}
            >
                {Shared.GetDialogButton(
                    setState,
                    buttonClass,
                    "AddEditUserList",
                    [item._id],
                    "👥",
                    true
                )}
                {(parts?.length < 3) &&
                Shared.GetDialogButton(
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
                        Shared.DeleteItem(projects, setData, item._id)
                    }}
                >
                    🗑️
                </button>
            </div>
            )}
        </>
    )
}

export default ItemActions