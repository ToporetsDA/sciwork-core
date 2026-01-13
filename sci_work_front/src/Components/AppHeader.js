// Libraries
import { useState, useRef, useEffect, useMemo, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
//Styles, Classes, Constants
import '../css/components/AppHeader.css'
import { PAGES, MORE_PAGES } from '../constants'
//Methods, Components
import * as Shared from './pages/shared'
// Resources
import logo from '../logo.svg'

const AppHeader = () => {

    const {
        state, setState,
        userData,
        isLoggedIn, setLoggedIn,
        notifications, setNotifications,
        organisationType
    } = useContext(Shared.AppContext)

    const navigate = useNavigate()

    const format = (str) => {
        return str.replace(/\s+/g, '')
    }

    const [isMoreOpen, setIsMoreOpen] = useState(false)
    const dropdownRef = useRef(null)
    
    const pages = [...PAGES]
    if (organisationType) {
        pages[2] = 'Projects'
    }
    else {
        pages[2] = 'Subjects'
    }
    
    const morePages = [...MORE_PAGES]
    if (userData.genStatus === 0) {
        morePages.push('User List')
    }

    const notificationsMark = useMemo(() => {
        if (isLoggedIn === true) {
            return notifications.filter(notification => notification.state === "unseen").length
        }
        return -1
    }, [notifications, isLoggedIn])

    const setAllSeen = () => {
        setNotifications(notifications.map(n => {
            if (n.state === "unseen") {
                const copy = new Notification(
                    n._id,
                    "seen",
                    n.page,
                    n.content,
                    new Date(`${n.generationDate}T${n.generationTime}:00`))
                return copy
            }
            else {
                return n
            }
        }))
    }

    //go to page
    const handleClick = (page) => {
        navigate(`/${page}`)
        setIsMoreOpen(false)

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
                setIsMoreOpen(false)
            }
        }

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
                            onClick={setIsMoreOpen(!isMoreOpen)}
                            ref={dropdownRef}
                        >
                            <p
                                onClick={setIsMoreOpen(!isMoreOpen)}
                                style={{
                                    fontWeight: isMoreOpen ? 'bold' : 'normal',
                                    pointerEvents: 'auto',
                                    opacity: isMoreOpen ? 0.5 : 1,
                                }}
                            >
                                More
                            </p>
                            {!isMoreOpen && notificationsMark > 0 && (
                                    <span className="notification-circle">{(notificationsMark > 99) ? "99+" : notificationsMark}</span>
                            )}
                            {isMoreOpen && (
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
                        <p>Log In/Register</p>
                    </li>
                )}
            </ul>
        </header>
    )}

export default AppHeader