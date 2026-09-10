import { useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router"
import { useNavigate, createSearchParams } from "react-router-dom"

import axios from "axios"

import Header from "../components/Header.js"
import Footer from "../components/Footer.js"
import Loader from "../components/Loader.js"
import Error from "../components/Error.js"
import SignUp from "../components/SignUp.js"
import Login from "../components/Login.js"
import Reset from "../components/Reset.js"
import NoTickets from "../components/NoTickets.js"
import Ticket from "../components/Ticket.js"
import PopUp from "../components/PopUp.js"

import SelectArrow from "../assets/SelectArrow.svg"

import { datePrettify } from "../utils/datePrettify.js"

import "../styles/Tickets.css"

function Tickets() {
    const navigate = useNavigate()

    const [searchParams, setSearchParams] = useSearchParams()

    const page = searchParams.get("page")

    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
    const [error, setError] = useState({})
    const [isError, setIsError] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const [isLogin, setIsLogin] = useState(false)
    const [isReset, setIsReset] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [isTicket, setIsTicket] = useState(false)
    const [ticketData, setTicketData] = useState("")
    const [isPopUp, setIsPopUp] = useState(false)

    const [tickets, setTickets] = useState ([])
    const [ticketsOverallCount, setTicketsOverallCount] = useState(0)

    const [isIdAscending, setIsIdAscending] = useState(true)
    const [isSubjectAscending, setIsSubjectAscending] = useState(false)
    
    const handlePopUpAction = (event) => {
        if (event.target.innerText === "Cancel") {
            setIsPopUp(false)
        } else {
            setIsPopUp(false)
            resolveAll()
        }
    }

    const resolveAll = () => {
        setIsLoaded(false)

        const sortedTickets = tickets.toSorted((a, b) => {
            return +a.id - +b.id
        })

        axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/sys/deleteTickets`, 
            {
                data: {
                    from: sortedTickets[0].id,
                    to: sortedTickets.at(-1).id
                },
                withCredentials: true
            }
        ).then(data => {
            setIsLoaded(true)
            navigate(0)
        }).catch(error => {
            setIsLoaded(true)

            if (axios.isCancel?.(error) || error.name === "CanceledError") return

            if (error.response) {
                if (process.env.REACT_APP_NODE_ENV === "development" || error.response.status === 429) {
                    setError(`Error response: ${error.response.status} ${error.response.statusText}`)
                    setIsError(true)
                }
            } else if (error.request) {
                setError("Network error: no response from server")
                setIsError(true)
            } else {
                if (process.env.REACT_APP_NODE_ENV === "development") {
                    setError(`Request error: ${error.message}`)
                    setIsError(true)
                }
            }
        })
    }

    const resolve = (index) => {
        axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/sys/deleteTickets`, 
            {
                data: {
                    from: tickets[index].id,
                    to: tickets[index].id
                },
                withCredentials: true
            }
        ).then(data => {
            setTickets(tickets.filter((item, i) => index != i))
            if (tickets.length == 1) navigate(0)
        }).catch(error => {
            setIsLoaded(true)

            if (axios.isCancel?.(error) || error.name === "CanceledError") return

            if (error.response) {
                if (process.env.REACT_APP_NODE_ENV === "development" || error.response.status === 429) {
                    setError(`Error response: ${error.response.status} ${error.response.statusText}`)
                    setIsError(true)
                }
            } else if (error.request) {
                setError("Network error: no response from server")
                setIsError(true)
            } else {
                if (process.env.REACT_APP_NODE_ENV === "development") {
                    setError(`Request error: ${error.message}`)
                    setIsError(true)
                }
            }
        })
    }
    
    const subjectOrderMap = {
        "Subscription": 1,
        "System bug": 2,
        "How to": 3,
        "Partnership": 4,
        "Other": 5
    }

    const sortById = (value) => {
        setIsSubjectAscending(false)
        setTickets(tickets.toSorted((a, b) => {
            return isIdAscending ? +b.id - +a.id : +a.id - +b.id
        }))
        setIsIdAscending(!isIdAscending)
    }

    const sortBySubject = () => {
        setIsIdAscending(false)
        setTickets(tickets.toSorted((a, b) => {
            const scoreA = subjectOrderMap[a.subject] || Infinity
            const scoreB = subjectOrderMap[b.subject] || Infinity
            return isSubjectAscending ? scoreB - scoreA : scoreA - scoreB
        }))
        setIsSubjectAscending(!isSubjectAscending)
    }

    const pageHandler = (action) => {
        if ((page == 1 && action == -1) || (page == Math.ceil(ticketsOverallCount / 100) && action == 1)) return
        
        setIsIdAscending(true)
        setIsSubjectAscending(false)

        navigate({
            pathname: "/tickets",
            search: createSearchParams({
                page: String(+page + +action)
            }).toString()
        })
    }

    const handleTicketClick = (event, index) => {
        if (event.target.localName === "td") {
            setIsTicket(true)
            setTicketData(tickets[index])
        }
    }

    const handleLogin = () => {
        setIsLogin(true)
    }

    const getTicketsCount = async (controller = {}) => {
        setIsLoaded(false)
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/sys/getTicketsCount`, 
            {
                signal: controller.signal,
                withCredentials: true
            }
        ).then(data => {
            setTicketsOverallCount(data.data.data[0].count)
        }).catch(error => {
            setIsLoaded(true)

            if (axios.isCancel?.(error) || error.name === "CanceledError") return

            if (error.response) {
                if (process.env.REACT_APP_NODE_ENV === "development" || error.response.status === 429) {
                    setError(`Error response: ${error.response.status} ${error.response.statusText}`)
                    setIsError(true)
                }
            } else if (error.request) {
                setError("Network error: no response from server")
                setIsError(true)
            } else {
                if (process.env.REACT_APP_NODE_ENV === "development") {
                    setError(`Request error: ${error.message}`)
                    setIsError(true)
                }
            }
        })
    }

    const getTicketsPerPage = async (controller = {}) => {
        setIsLoaded(false)
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/sys/getTicketsPerPage/${page}`, 
            {
                signal: controller.signal,
                withCredentials: true
            }
        ).then(data => {
            setTickets(data.data.data)
        }).catch(error => {
            setIsLoaded(true)

            if (axios.isCancel?.(error) || error.name === "CanceledError") return

            if (error.response) {
                if (process.env.REACT_APP_NODE_ENV === "development" || error.response.status === 429) {
                    setError(`Error response: ${error.response.status} ${error.response.statusText}`)
                    setIsError(true)
                }
            } else if (error.request) {
                setError("Network error: no response from server")
                setIsError(true)
            } else {
                if (process.env.REACT_APP_NODE_ENV === "development") {
                    setError(`Request error: ${error.message}`)
                    setIsError(true)
                }
            }
        })
    }

    const getProfile = async (controller = {}) => {
        setIsLoaded(false)
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/profile`, {
                signal: controller.signal,
                withCredentials: true
            }
        ).then(data => {
            setIsUserLoggedIn(true)
            setIsAdmin(data.data.data[0].is_admin)
            setIsLoaded(true)
        }).catch(error => {
            setIsLoaded(true)

            if (axios.isCancel?.(error) || error.name === "CanceledError") return

            if (error.response) {
                if (process.env.REACT_APP_NODE_ENV === "development" || error.response.status === 429) {
                    setError(`Error response: ${error.response.status} ${error.response.statusText}`)
                    setIsError(true)
                }
            } else if (error.request) {
                setError("Network error: no response from server")
                setIsError(true)
            } else {
                if (process.env.REACT_APP_NODE_ENV === "development") {
                    setError(`Request error: ${error.message}`)
                    setIsError(true)
                }
            }
        })
    }

    useEffect(() => {
        if (!page) {
            setSearchParams({page: "1"})
            navigate(0)
        }

        const controller = new AbortController()

        getProfile(controller)
        getTicketsPerPage(controller)
        getTicketsCount(controller)

        return () => controller.abort()
    }, [searchParams])

    return (
        <>
            <Reset isOpen={isReset} onClose={() => setIsReset(false)}/>
            <SignUp isOpen={isSignUp} setIsSignUp={setIsSignUp} setIsLogin={setIsLogin} onClose={() => setIsSignUp(false)}/>
            <Login isOpen={isLogin} setIsLogin={setIsLogin} setIsSignUp={setIsSignUp} setIsReset={setIsReset} onClose={() => setIsLogin(false)}/>
            <PopUp isOpen={isPopUp} onClose={() => setIsPopUp(false)} actionHandler={handlePopUpAction} title={"Deletion"} content={"All tickets from this page will be deleted. This changes are irreversible. Are you sure?"}/>
            <Header isAdmin={isAdmin} isUserLoggedIn={isUserLoggedIn} currentPage={"tickets"} setIsSignUp={setIsSignUp} setIsLogin={setIsLogin}/>
            { isError ? (
                <Error message={error} cancelMessage={setIsError}/>
            ) : (
                <></>
            )}
            { isLoaded ? (
                isUserLoggedIn ? (
                    isAdmin ? (
                        tickets.length ? (
                            <div className="tickets-content">
                                {isTicket ? (
                                    <Ticket ticketData={ticketData} setIsTicket={setIsTicket} setError={setError} setIsError={setIsError} />
                                ) : (
                                <>
                                    <div className="tickets-title">
                                            <h1>Users tickets</h1>
                                            <button className="delete-all" onClick={() => setIsPopUp(true)}>Delete All</button>
                                        </div>
                                        <div className="tickets">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th onClick={sortById} className="tickets-id-th">id</th>
                                                        <th onClick={sortBySubject} className="tickets-subject-th">subject</th>
                                                        <th>name</th>
                                                        <th>email</th>
                                                        <th>date</th>
                                                        <th>message</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {tickets.map((ticket, index) =>
                                                        <tr key={index} tabIndex="0" onClick={(event) => handleTicketClick(event, index)}>
                                                            <td className="ticket-id">{ticket.id}</td>
                                                            <td className="ticket-subject">{ticket.subject}</td>
                                                            <td className="ticket-name">{ticket.name}</td>
                                                            <td className="ticket-email">{ticket.email}</td>
                                                            <td className="ticket-date">{datePrettify(ticket.timestamp)}</td>
                                                            <td className="ticket-message">{ticket.message}</td>
                                                            <td><button className="resolve" onClick={() => resolve(index)}>Resolve</button></td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="tickets-controlls">
                                                <img src={SelectArrow} style={{transform: "rotate(90deg)"}} onClick={() => pageHandler(-1)}/>
                                                <p>{page}/{Math.ceil(ticketsOverallCount/100)}</p>
                                                <img src={SelectArrow} style={{transform: "rotate(-90deg)"}} onClick={() => pageHandler(1)}/>
                                        </div>
                                    </>
                                )}
                                
                            </div>
                        ) : (
                            <NoTickets />                                
                        )
                    ) : (
                        <div className="request-content">
                            <div className="request">
                                <h1>Forbidden</h1>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="request-content">
                        <div className="request">
                            <h1>You are not signed in</h1>
                            <button onClick={handleLogin}>Sign In</button>
                        </div>
                    </div>
                )
            ) : (
                <Loader />
            )}
            <Footer />
        </>
    )
}

export default Tickets