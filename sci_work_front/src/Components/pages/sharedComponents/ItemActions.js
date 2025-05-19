import * as Shared from './'

const ItemActions = ({userData, data, setData, setState, item, rights}) => {

    const getAccess = (item) => {
        return item.userList?.find(user => user.id === userData._id)?.access || 0
    }

    return (
        <>
            {!item.deleted && rights.edit.includes(getAccess(item)) && (
            <div className="actions">
                <button
                className="gearButton"
                onClick={(e) => {
                    e.stopPropagation()
                    setState((prevState) => ({
                    ...prevState,
                    currentDialog: {
                        name: 'AddEditItem',
                        params: [item],
                    },
                    }))
                }}
                >
                ⚙️
                </button>
                <button
                className="deleteButton"
                onClick={(e) => {
                    e.stopPropagation()
                    Shared.DeleteItem(data, setData, item._id)
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