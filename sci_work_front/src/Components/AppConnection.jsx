import { useState, useEffect, useCallback, useContext } from 'react'
import { useTranslation } from "react-i18next"
import { useWebSocket } from 'react-use-websocket'

import { createProjects, projectVerUp, createActivity, createActivities, activityVerUp } from '../lib/classes'
import { getItemById } from '../lib/helpers'

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