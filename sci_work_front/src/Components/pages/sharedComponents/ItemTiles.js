import { useNavigate } from "react-router-dom"

import * as Shared from './'

const ItemTiles = ({userData, data, setData, setState, itemsToDisplay, rights, recentActivities, setRecentActivities}) => {

    const navigate = useNavigate()

    //open project
    const goTo = Shared.GoTo

    const getAccess = (item) => {
        return item.userList?.find(user => user.id === userData._id)?.access || 0
    }

    return (
        <>
            {itemsToDisplay.map((project, index) => (
                <div
                    key={index}
                    className={`
                    card
                    ${(new Date(project.endDate) - new Date()) / (24 * 60 * 60 * 1000) < 30 ? 'expiring' : ''}
                    ${(new Date(project.endDate) < new Date()) ? 'expired' : ''}
                    `}
                    onClick={() => {
                    navigate(goTo(project, data, recentActivities, setRecentActivities))
                    }}
                >
                    <h3 className="name">{project.name}</h3>
                    <p className="timeLimit">
                    {project.startDate ? project.startDate : 'N/A'} - {project.endDate}
                    </p>
                    {!project.deleted && rights.edit.includes(getAccess(project)) && (
                    <div className="actions">
                        <button
                        className="gearButton"
                        onClick={(e) => {
                            e.stopPropagation()
                            setState((prevState) => ({
                            ...prevState,
                            currentDialog: {
                                name: 'AddEditItem',
                                params: [project],
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
                            Shared.deleteItem(data, setData, project._id)
                        }}
                        >
                        🗑️
                        </button>
                    </div>
                    )}
                </div>
            ))}
        </>
    )
}

export default ItemTiles