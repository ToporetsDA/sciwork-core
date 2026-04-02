import { useCallback, useContext } from 'react'
import { useWebSocket } from 'react-use-websocket'

import {
    createUserData, createUsersData,
    createProjects, createProjectFromObject,
    createActivity, createActivities
} from '../../../lib/classes'
import { getItemById } from '../../../lib/helpers'

import { AppContext } from '../../pageAssets/shared'

const AppSocket = ({
    setProjects,
    setActivities,
    setRights,
    setUsers,
    sessionToken,
    wsUrl
}) => {

    const {
        setUserData,
        projects,
        activities,
        setLoggedIn
    } = useContext(AppContext)

    const handleEventData = useCallback((response) => {

        const handlers = {
            init: () => {
                setLoggedIn(true)
            },

            users: data => {
                setUsers(createUsersData(data))
            },

            user: data => {
                setUserData(createUserData(data))
            },

            projects: data => {
                setProjects(createProjects(data))
            },

            project: data => {
                const updatedData = projects.map(item =>
                    item._id === data._id
                        ? createProjectFromObject(data)
                        : item
                )
                setProjects(updatedData)
            },

            activities: data => {
                setActivities(createActivities(data))
            },

            activity: data => {
                if (getItemById(activities, data._id)?._id) {
                    setActivities(prev =>
                        prev.map(act =>
                            act._id === data._id
                                ? createActivity(data)
                                : act
                        )
                    )
                }
                else {
                    setActivities(prev => [...prev, createActivity(data)])
                }
            },

            delete: data => {
                const item =
                    getItemById(projects, data._id) ||
                    getItemById(activities, data._id)

                item?.deleteItem(true, projects, setProjects, false)
            },

            organisation: data => {
                setRights(data.organisation.rights)
            }
        }

        const { type, data } = response.data
        const handler = handlers[type]
        handler?.(data)

    }, [activities, setActivities,
        projects, setProjects, 
        setRights,
        setUserData,
        setUsers,
        setLoggedIn
    ])


    const handleResponse = useCallback((event) => {
        try {
            const response = JSON.parse(event.data)
            handleEventData(response)
        } catch (error) {
            console.error("Error processing message:", error.message)
        }
    }, [handleEventData])

    useWebSocket(sessionToken ? wsUrl : null, {
        onOpen: () => {
            console.log('WebSocket connection established.')
        },
        onClose: () => console.log('WebSocket connection closed'),
        onMessage: handleResponse,
        onError: (error) => {
            console.error('WebSocket error:', error)
        },
        shouldReconnect: () => true,
        queryParams: { token: sessionToken },
        share: true
    })

    return null
}

export default AppSocket

/* Legacy code.
    // ==================================
    // request management                           MOVED TO REST
    // ==================================

    const { sendMessage } = useWebSocket(wsUrl, {
        onOpen: () => {
            console.log('WebSocket connection established.')
            // Send the login message after the connection is established
            sendMsg("login", { login: formValues.login });
        },
        onClose: () => console.log('WebSocket connection closed'),
        onMessage: (event) => handleResponse(event),
        onError: (error) => {
            console.error('WebSocket error:', error)
        },
        shouldReconnect: () => true, // Reconnect on disconnection
        queryParams: { token: sessionToken }, // Optional query params
        share: true // Share the WebSocket instance between components
    })

    // Callback to send a message
    const sendMsg = useCallback((type, data) => {
        const message = {
            type: type,          // e.g., "login"
            sessionToken,        // Auth token
            data: data,          // Payload data
            timestamp: new Date().toISOString(), // Optional timestamp
        }

        // Send the message as a JSON string
        sendMessage(JSON.stringify(message))
        console.log('Sent message:', message)

    }, [sendMessage, sessionToken])

    useEffect(() => {
        onReady(sendMsg)
    }, [ onReady, sendMsg ])


    const handleResponseConfirm = useCallback((response) => {
        const { data, error } = response.data

        //save or disard
        const action = error
            ? (backup, obj) => backup.val
            : (backup, obj) => verUp(obj, backup.type)

        // data type handlers
        const handlers = {
            UserData: backup => setUserData(
                action(backup, userData)
            ),
            Project: backup => setProjects(
                prev => prev.map(p => p._id === backup.val._id
                    ? action(backup, p)
                    : p
                )
            ),
            Activity: backup => setActivities(
                prev => prev.map(a => a._id === backup.val._id
                    ? action(backup, a)
                    : a
                )
            ),
            FunctionalSettings: backup => setFunctionalSettings(
                action(backup, functionalSettings)
            ),
            DisplaySettings: backup => setDisplaySettings(
                action(backup, displaySettings)
            )
        }

        // save changes or roll back
        
        const backup = previousVersionsRef.current[data.id]

        if (handlers.keys().includes(backup.type)) {
            handlers[backup.type]?.(backup)
        }
        else {
            console.warn("Unknown object type: ", backup.type, ". Update failed")
        }

        delete previousVersionsRef.current[data.id]
    }, [
        previousVersionsRef,
        setActivities,
        setProjects,
        userData, setUserData,
        functionalSettings, setFunctionalSettings,
        displaySettings, setDisplaySettings
    ])

    //from handleEventData

            // case "init": {
            //     // user
            //     setUserData(createUserData(data.user))
            //     // top layer data
            //     setProjects(createProjects(data.items))
            //     // other users for top layer data
            //     setUsers(createUsersData(data.users))
            //     // tech
            //     setRights(data.organisation.rights)
            //     setDisplaySettings(createDisplaySettings(data.settings.display))
            //     setFunctionalSettings(createFunctionalSettings(data.settings.functional))
            //     break
            // }
    */