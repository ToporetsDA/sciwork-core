import { useState, useRef, useEffect, useCallback, useContext, useParams, useLocation } from 'react'
import useWebSocket from 'react-use-websocket'

import { createProjects, projectVerUp, createActivity, createActivities, activityVerUp } from '../lib/classes'
import { getItemById } from '../lib/helpers'

import { AppContext } from './pageAssets/shared'
import { LogIn } from './dialogs'

const Connection = ({
    setProjects,
    setActivities,
    setRights,
    setUsers,
    isUserUpdatingProjects, setIsUserUpdatingProjects,
    isUserUpdatingActivities, setIsUserUpdatingActivities,
    isUserUpdatingUserData, setIsUserUpdatingUserData,
    previousVersionsRef
}) => {

    const {
        dialog, setDialog,
        userData, setUserData,
        projects,
        activities,
        isLoggedIn, setLoggedIn
    } = useContext(AppContext)

    const { projectId, activityId } = useParams()

    const { pathname } = useLocation()
    const currentPage = pathname.split("/")[1] || "HomePage"

    const [servers, setServers] = useState([])       // список з бекенду
    const [loading, setLoading] = useState(true)     // UI-флаг
    const [sessionToken, setToken] = useState()      // auth
    const [formValues, setFormValues] = useState()   // дані форми
    const [wsUrl, setWsUrl] = useState(null)         // websocket endpoint


    const format = (str) => {
        return str.replace(/\s+/g, '')
    }

    //create server address string
    const serverAddress = (address) => {
        // Get the address without the scheme (http:// or https://)
        let serverAddress = address.split('://')[1]
        
        // Remove trailing slash if present
        if (serverAddress.endsWith('/')) {
            serverAddress = serverAddress.slice(0, -1)
        }
        
        // Extract the domain and port
        const [domain, port] = serverAddress.split(':')
        
        // Increment the port by 1
        const newPort = parseInt(port, 10) + 1
        
        // Reassemble the address with the new port
        return `${domain}:${newPort}`
    }

    const { sendMessage, readyState } = useWebSocket(wsUrl, {
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

         // Reset flags
        setIsUserUpdatingProjects(false)
        setIsUserUpdatingActivities(false)
        setIsUserUpdatingUserData(false)
    }, [sendMessage, sessionToken, setIsUserUpdatingProjects, setIsUserUpdatingActivities, setIsUserUpdatingUserData])

    const handleResponseData = useCallback((response) => {
        const { type, data } = response.data

        const currentData = projects
        
        console.log("Received data type:", type)
        console.log("Fetched data:", data)

        // You can handle the data based on the type (user, projects, etc.)
        switch (type) {
            case "all": {
                setUserData(data.user)
                console.log(data.items)
                setProjects(createProjects(data.items))
                setRights(data.organisation.rights)
                setUsers(data.users)
                break
            }
            case "users": {
                setUsers(data)
                break
            }
            case "user": {
                setUserData(data)
                break
            }
            case "data": {
                setProjects(createProjects(data))
                break
            }
            case "project": {
                const updatedData = currentData.map(item =>
                    item._id === data._id ? data : item
                )
                setProjects(createProjects(updatedData))
                break
            }
            case "activities": {//add along with activity templates
                console.log("activities", data)
                setActivities(createActivities(data))
                break
            }
            case "activity": {
                //edit
                if (getItemById(activities, data._id)?._id) {
                    setActivities(prevActivities =>
                        prevActivities.map(act =>
                            act._id === data._id
                                ? createActivity(data)
                                : act
                        )
                    )
                }
                //add
                else {
                    setActivities(prevActivities => [...prevActivities, createActivity(data)])
                }
                break
            }
            case "delete": {//just _id
                const item = getItemById(projects, data._id)
                    || getItemById(activities, data._id)
                item?.deleteItem(true, currentData, setProjects, false)
                break
            }
            case "organisation": {
                setRights(data.organisation.rights)
                break
            }
            default: {
                console.log("Unknown data type:", type)
            }
        }
    }, [ activities, projects, setActivities, setProjects, setRights, setUserData, setUsers])

    const handleResponseConfirm = useCallback((response) => {
        const { data, error } = response.data
        console.log("confirm item", response.data, data.id, error)
        if (error) {
            const backup = previousVersionsRef.current[data.id]
            if (backup) {
                if (data.id === userData._id) {
                setUserData(backup)
                } else if (data.id.includes(".")) {
                setActivities(prev => prev.map(i => i._id === data.id ? backup : i))
                } else {
                setProjects(prev => prev.map(p => p._id === data.id ? backup : p))
                }
            }
            delete previousVersionsRef.current[data.id] // clean up
        }
        else {
            // notify user that update happened and increment its __v
            if (data.id === userData._id) {
                setUserData((prevData) => ({
                    ...prevData,
                    __v: prevData.__v + 1
                }))
            }
            else if (data.id.includes(".")) {
                setActivities(prevItems => 
                    prevItems.map(a => {
                        return a._id === data.id
                            ? activityVerUp(a)
                            : a
                    })
                )
            }
            else if (!data.id.includes(".")) {
                setProjects(prevItems =>
                    prevItems.map(p => {
                        return p._id === data.id
                            ? projectVerUp(p)
                            : p
                    })
                )
            }

            if (data.id in previousVersionsRef.current) {
                delete previousVersionsRef.current[data.id]
            }

            console.log(data.id, "updated successfully")
        }
    }, [previousVersionsRef, setActivities, setProjects, setUserData, userData._id])

    const handleResponse = useCallback((event) => {
        console.log("from handleResponse: ")
        try {
            const response = JSON.parse(event.data)
             // This will log the entire response
            // console.log(response)

            switch(response.message) {
                case "data": {
                    handleResponseData(response)
                    break
                }
                case "confirm": {
                    handleResponseConfirm(response)
                    break
                }
                default: {
                    console.log("Unknown message: ", response.message)
                }
            }
            setLoggedIn(true);
        } catch (error) {
            console.error("Error processing message:", error.message)
        }
    }, [handleResponseConfirm, handleResponseData, setLoggedIn])

    //send update ONLY when page changes
    const lastSentPage = useRef({
        currentPage: 'HomePage',
        currentProject: undefined,
        currentActivity: undefined
    })
    
    // (V)
    useEffect(() => {
        if (
            (lastSentPage.current.currentPage === currentPage && lastSentPage.current.currentProject === projectId)
            || !isLoggedIn
        ) {
            return
        }
        const location = projectId || currentPage
        sendMsg("goTo", { page: format(location), isId: (!!projectId)})
        lastSentPage.current = {
            currentPage: currentPage,
            currentProject: projectId,
            currentActivity: activityId
        }
    }, [sendMsg, currentPage, projectId, activityId, isLoggedIn])

    // Track user-initiated changes to data
    const updateByUser = useCallback((item, toDo, itemType) => {

        if (readyState === 1) { // Check if WebSocket is open
            sendMsg(toDo, item)
            console.log("Sent update:")
        } else {
            console.error(`WebSocket is not open. Cannot send ${itemType} update.`)
        }

    }, [readyState, sendMsg])

    // Trigger user-initiated updates
    // (V)
    useEffect(() => {
        if (isUserUpdatingProjects) {
            updateByUser(getItemById(projects, isUserUpdatingProjects), "addEditData", "metadata")
        }
        if (isUserUpdatingActivities) {
            updateByUser(getItemById(activities, isUserUpdatingActivities), "addEditContent", "content")
        }
        if (isUserUpdatingUserData) {
            updateByUser(userData, "addEditUser", "user")
        }
    }, [projects, activities, userData, updateByUser, isUserUpdatingProjects, isUserUpdatingActivities, isUserUpdatingUserData])

    //on login
    const loginToServer = async (formValues) => {
        const selectedServer = servers.find((server) => server.id === formValues.server)
    
        if (!selectedServer) {
            alert("Invalid server selected.")
            return
        }
    
        try {
            const response = await fetch(`${selectedServer.address}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login: formValues.login, password: formValues.password })
            })

            if (response.status === 200) {
                console.log('Login successful')
                const data = await response.json()
                setToken(data.sessionToken)

                setFormValues(formValues)

                // Set WebSocket URL dynamically
                const wsAddress = `ws://${serverAddress(selectedServer.address)}`
                setWsUrl(wsAddress)

                console.log('WebSocket URL:', wsAddress)
            }
            else {
                alert('Login failed')
            }
        } catch (error) {
            alert('An error occurred during login.')
            console.error(error)
        }
    }

    //get list of working servers
    // (V)
    useEffect(() => {
        const fetchServers = async () => {
            try {
                const response = await fetch('http://localhost:3000/servers/list')
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }
                
                const data = await response.json();
                setServers(data)
                setLoading(false)
            } catch (error) {
                console.error("Failed to fetch servers:", error)
                setLoading(false)
            }
        }

        fetchServers()
    }, [])

    return (
        <div>
            {loading ? (
                <p>Loading servers...</p> // Display loading message while fetching servers
            ) : (
                <>
                    {dialog.name === "LogIn" &&
                        <LogIn
                            setState={setDialog}
                            isLoggedIn={isLoggedIn}
                            servers={servers}
                            loginToServer={loginToServer}
                        />
                    }
                </>
            )}
        </div>
    )
}

export default Connection
