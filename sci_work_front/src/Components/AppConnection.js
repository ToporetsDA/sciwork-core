import React, { useState, useRef, useEffect, useCallback } from 'react'
import useWebSocket from 'react-use-websocket'
import LogIn from './dialogs/LogIn'

import * as Shared from './pages/sharedComponents'

const Connection = ({
    state, setState,
    userData, setUserData,
    projects, setProjects,
    activities, setActivities,
    isLoggedIn, setLoggedIn,
    setRights,
    setUsers,
    isUserUpdatingProjects, setIsUserUpdatingProjects,
    isUserUpdatingActivities, setIsUserUpdatingActivities,
    isUserUpdatingUserData, setIsUserUpdatingUserData
}) => {

    const [servers, setServers] = useState([])
    const [loading, setLoading] = useState(true)
    const [sessionToken, setToken] = useState()
    const [formValues, setFormValues] = useState()
    const [wsUrl, setWsUrl] = useState(null)

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

    const handleResponse = useCallback((event) => {
        console.log("from handleResponse: ")
        try {
            const response = JSON.parse(event.data)
            const currentData = projects
            console.log(response) // This will log the entire response
        
            // Now, you can access specific parts of the response
            switch(response.message) {
            case "data": {
                const { type, data } = response.data
        
                console.log("Received data type:", type)
                console.log("Fetched data:", data)
        
                // You can handle the data based on the type (user, projects, etc.)
                switch (type) {
                case "all": {
                    setUserData(data.user)
                    console.log(data.items)
                    setProjects(data.items)
                    setRights(data.organisation.rights)
                    setUsers(data.users)
                    break
                }
                case "user": {
                    setUserData(data)
                    break
                }
                case "data": {
                    setProjects(data)
                    break
                }
                case "project": {
                    const updatedData = currentData.map(item =>
                        item._id === data._id ? data : item
                    )
                    setProjects(updatedData)
                    break
                }
                case "activities": {//add along with activity templates
                    console.log("activities", data)
                    setActivities(data)
                    break
                }
                case "delete": {//just _id
                    Shared.DeleteItem(currentData, setProjects, data._id)
                    break
                }
                case "organisation": {
                    setRights(data.organisation.rights)
                    break
                }
                case "users": {
                    setUsers(data)
                    break
                }
                default: {
                    console.log("Unknown data type:", type)
                }
                }
                break
            }
            case "addEdit": {
                const { type, data: fetchedData } = response.data
        
                console.log("Received data type:", type)
                console.log("Updated:", fetchedData)
        
                // You can handle the data based on the type (user, projects, etc.)
                switch (type) {
                case"item": {
                    const item = fetchedData
                    if (projects.find(d => d._id === item._id).length === 0) {
                    setProjects(prevData => ({ ...prevData, item }))
                    }
                    else {
                        setProjects(prevData => 
                            prevData.map(d => 
                            d._id === item._id ? item : d
                        ))
                    }
                    break
                }
                case"user": {
                    setUserData(fetchedData)
                    break
                }
                default: {

                }
                }
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
    }, [projects, setProjects, setActivities, setLoggedIn, setRights, setUsers, setUserData])

    //send update ONLY when page changes
    const lastSentProject = useRef(null)
    useEffect(() => {
        if (lastSentProject.current === state.currentPage || !isLoggedIn) return
            const location = state.currentProject || state.currentPage
            sendMsg("goTo", { page: format(location), isId: (!!state.currentProject)})
        lastSentProject.current = state.currentPage
    }, [sendMsg, state.currentPage, state.currentProject, state.currentActivity, isLoggedIn])

    // Track user-initiated changes to `projects`
    const updateProjects = useCallback((item) => {

        if (readyState === 1) { // Check if WebSocket is open
            sendMsg("addEditData", item)
            console.log("Sent item update:", item)
        } else {
            console.error("WebSocket is not open. Cannot send item update.")
        }

    }, [readyState, sendMsg])

    // Trigger project update when a user modifies `projects`
    useEffect(() => {
        if (isUserUpdatingProjects) {
            updateProjects(Shared.GetItemById(projects, isUserUpdatingProjects[0]))
        }
    }, [projects, updateProjects, isUserUpdatingProjects])

    // Track user-initiated changes to `activities`
    const updateActivities = useCallback((item) => {

        if (readyState === 1) { // Check if WebSocket is open
            sendMsg("addEditData", item)
            console.log("Sent item update:", item)
        } else {
            console.error("WebSocket is not open. Cannot send item update.")
        }

    }, [readyState, sendMsg])

    // Trigger project update when a user modifies `activities`
    useEffect(() => {
        if (isUserUpdatingActivities) {
            for (let i = 0; i < isUserUpdatingActivities.length; i++) {
                updateActivities(Shared.GetItemById(activities, isUserUpdatingActivities[i]))
            }
        }
    }, [activities, updateActivities, isUserUpdatingActivities])

    // Track user-initiated changes to `userData`
    const updateUser = useCallback((updatedUserData) => {

        if (readyState === 1) { // Check if WebSocket is open
            sendMsg("addEditUser", updatedUserData)
            console.log("Sent user update:", updatedUserData)
        } else {
            console.error("WebSocket is not open. Cannot send user update.")
        }
    }, [readyState, sendMsg])

    // Trigger user update when a user modifies `userData`
    useEffect(() => {
        if (isUserUpdatingUserData) {
            updateUser(userData) // Pass session token and updated user data
        }
    }, [userData, updateUser, isUserUpdatingUserData])

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

    //get list of organisations whos servers are on
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
                    {state.currentDialog.name === "LogIn" &&
                        <LogIn
                            setState={setState}
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
