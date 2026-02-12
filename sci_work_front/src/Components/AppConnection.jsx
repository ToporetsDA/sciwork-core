import { useState, useEffect, useCallback, useContext } from 'react'
import { useTranslation } from "react-i18next"
import { useWebSocket } from 'react-use-websocket'

import {
    createUserData, createUsersData,
    createDisplaySettings,
    createFunctionalSettings,
    createProjects, createProjectFromObject,
    createActivity, createActivities
} from '../lib/classes'
import { getItemById, verUp } from '../lib/helpers'

import { AppContext } from './pageAssets/shared'
import { LogIn } from './dialogs'

const Connection = ({
    onReady,
    setProjects,
    setActivities,
    setRights,
    setUsers,
    previousVersionsRef
}) => {

    const {
        dialog,
        userData, setUserData,
        displaySettings, setDisplaySettings,
        functionalSettings, setFunctionalSettings,
        projects,
        activities,
        setLoggedIn
    } = useContext(AppContext)

    const { t } = useTranslation("base.connection")

    // ==================================
    // const, vars, helpers and state management
    // ==================================

    const [servers, setServers] = useState([])       // список з бекенду
    const [loading, setLoading] = useState(true)     // UI-флаг
    const [sessionToken, setToken] = useState()      // auth
    const [formValues, setFormValues] = useState()   // дані форми
    const [wsUrl, setWsUrl] = useState(null)         // websocket endpoint

    //get list of working servers
    useEffect(() => {
        const fetchServers = async () => {
            try {
                const response = await fetch('http://localhost:3000/servers/list') //load from outside later
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

    // ==================================
    // request management
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

    // ==================================
    // response management
    // ==================================

    const handleResponseData = useCallback((response) => {
        const { type, data } = response.data

        const currentData = projects
        
        console.log("Received data type:", type)
        console.log("Fetched data:", data)

        // You can handle the data based on the type (user, projects, etc.)
        switch (type) {
            case "init": {
                // user
                setUserData(createUserData(data.user))
                // top layer data
                setProjects(createProjects(data.items))
                // other users for top layer data
                setUsers(createUsersData(data.users))
                // tech
                setRights(data.organisation.rights)
                setDisplaySettings(createDisplaySettings(data.settings.display))
                setFunctionalSettings(createFunctionalSettings(data.settings.functional))
                break
            }
            case "users": {
                setUsers(createUsersData(data))
                break
            }
            case "user": {
                setUserData(createUserData(data))
                break
            }
            case "settings": {
                const settings = data
                switch(settings.type) {
                    case "display": {
                        setDisplaySettings(createDisplaySettings(settings.display))
                        break
                    }
                    case "functional": {
                        setFunctionalSettings(createFunctionalSettings(settings.functional))
                        break
                    }
                    default: {
                        console.log("Unknown settings type:", type)
                    }
                }
                break
            }
            case "projects": {
                setProjects(createProjects(data))
                break
            }
            case "project": {
                const updatedData = currentData.map(item =>
                    item._id === data._id ? createProjectFromObject(data) : item
                )
                setProjects(updatedData)
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
    }, [
        activities, setActivities,
        projects, setProjects, 
        setRights,
        setUserData,
        setUsers,
        setDisplaySettings,setFunctionalSettings
    ])

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

    const handleResponse = useCallback((event) => {

        const responses = {
            data: r => handleResponseData(r),
            confirm: r => handleResponseConfirm(r)
        }

        try {
            const response = JSON.parse(event.data)

            if (responses.keys().includes(response.message)) {
                responses[response.message]?.(response)
            }
            else {
                console.warn("Unknown message: ", response.message)
            }

            setLoggedIn(true)
            
        } catch (error) {
            console.error("Error processing message:", error.message)
        }
    }, [handleResponseConfirm, handleResponseData, setLoggedIn])

    // ==================================
    // log in logic
    // ==================================

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

    // ==================================

    return (
        <div>
            {loading ? (
                <p>{t("fallback")}</p> // Display loading message while fetching servers
            ) : (
                <>
                    {dialog.name === "LogIn" &&
                        <LogIn
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