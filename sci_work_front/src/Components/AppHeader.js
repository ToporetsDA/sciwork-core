import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from "react-router-dom"
import '../css/components/AppHeader.css'
import logo from "../logo.svg"

const AppHeader = ({ state, setState, userData, setUserData, isLoggedIn, setLoggedIn, notifications, setNotifications, organisationType}) => {

    const navigate = useNavigate()

    const format = (str) => {
        return str.replace(/\s+/g, '')
    }

    const [isDropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)
    
    const pages = ['Home Page', 'Schedule', (organisationType) ? 'Projects' : 'Subjects']
    const morePages = (userData.genStatus === 0) ? (
        ['Profile', 'User List', 'Notifications', 'Settings']
    ) : (
        ['Profile', 'Notifications', 'Chats', 'Settings']
    )

    const notificationsMark = useMemo(() => {
        if (isLoggedIn === true) {
        return notifications.filter(notification => notification.state === "unseen").length
        }
        return -1
    }, [notifications, isLoggedIn])

    const setAllSeen = () => {
        setNotifications(
            notifications.map(n => {
                if (n.state === "unseen") {
                    return { ...n, state: "unread" } // Change "unseen" to "unread"
                }
                if (n.state === "unread") {
                    return { ...n, state: "seen" } // Change "unread" to "seen"
                }
                return n // Leave other states as is
            })
        )
    }

    //go to page
    const handleClick = (page) => {
        navigate(`/${page}`)
        setDropdownOpen(false)

        if (page === "Notifications") {
            setAllSeen()
        }
    }

    const handleDialog = (dialog, params) => {
        setState((prevState) => ({
            ...prevState,
            currentDialog: {
                name: dialog,
                params: params
            }
        }))
    }

    //open dropdown menu with more pages
    const handleMore = () => {
        setDropdownOpen(!isDropdownOpen)
    }

    //log out
    const handleLogOut = () => {
        handleClick(format("Home Page"))
        handleDialog()
        setLoggedIn(false)
    }

    //close dropdown menu if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false)
            }
        };

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [dropdownRef])

    const getLi = (page) => {
        return (
            <li
                key={format(page)}
                onClick={() => handleClick(format(page))}
                className={state.currentPage === format(page) ? 'active' : ''}
                style={{
                fontWeight: state.currentPage === format(page) ? 'bold' : 'normal',
                pointerEvents: state.currentPage === format(page) ? 'none' : 'auto',
                opacity: state.currentPage === format(page) ? 0.5 : 1,
                }}
            >
                <p>{page}</p>
                {format(page) === 'Notifications' && notificationsMark > 0 && (
                    <span className="notification-circle">{(notificationsMark > 99) ? "99+" : notificationsMark}</span>
                )}
            </li>
        )
    }
    
    return (
        <header>
            <img className="logo" src={logo} alt="SciWork" />
                <ul className="menu">
                {(isLoggedIn === true) ? (
                    <>
                        {pages.map((page) => (
                            getLi(page)
                        ))}
                        <li
                            onClick={handleMore}
                            ref={dropdownRef}
                        >
                            <p
                                onClick={handleMore}
                                style={{
                                    fontWeight: isDropdownOpen ? 'bold' : 'normal',
                                    pointerEvents: 'auto',
                                    opacity: isDropdownOpen ? 0.5 : 1,
                                }}
                            >
                                More
                            </p>
                            {!isDropdownOpen && notificationsMark > 0 && (
                                    <span className="notification-circle">{(notificationsMark > 99) ? "99+" : notificationsMark}</span>
                            )}
                            {isDropdownOpen && (
                                <ul className="more">
                                    {morePages.map((page) => (
                                        getLi(page)
                                    ))}
                                    <li onClick={handleLogOut}><p>Log Out</p></li>
                                </ul>
                            )}
                        </li>
                    </>
                ) : (
                    <li
                        key={"LogIn"}
                        onClick={() => handleDialog("LogIn")}
                    >
                        <p>Log In</p>
                    </li>
                )}
            </ul>
        </header>
    )}

export default AppHeader