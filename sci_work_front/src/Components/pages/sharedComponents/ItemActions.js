import * as Shared from './'

const ItemActions = ({userData, projects, setData, setState, item, rights}) => {

    const parts = item?._id.split('.')
    const project = Shared.GetItemById(projects, parts[0])
    const accessibleItem = (parts.length < 3)
        ? item
        : Shared.FindItemWithParent(project.activities, "_id", parts[0] + '.' + parts[1], project).item

    return (
        <>
            {!item.deleted && rights.edit.includes(Shared.GetAccess(accessibleItem, userData)) && (
            <div className="actions">
                {Shared.GetDialogButton(
                    setState,
                    "usersButton",
                    "AddEditUserList",
                    [item._id],
                    "👥",
                    true
                )}
                {(parts?.length < 3) &&
                Shared.GetDialogButton(
                    setState,
                    "gearButton",
                    "AddEditItem",
                    [item, item._id],
                    "⚙️",
                    true
                )}
                <button
                    className="deleteButton"
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