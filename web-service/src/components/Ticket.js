import BackArrow from "../assets/BackArrow.svg"
import { useNavigate } from "react-router-dom"

import "../styles/Ticket.css"

import axios from "axios"

function Ticket({ ticketData, setIsTicket, setError, setIsError}) {
    const navigate = useNavigate()

    window.scrollTo(0, 0)
    
    const resolve = () => {
        axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/sys/deleteTickets`, 
            {
                data: {
                    from: ticketData.id,
                    to: ticketData.id
                },
                withCredentials: true
            }
        ).then(data => {
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

    const handleClose = () => {
        setIsTicket(false)
    }

    return (
        <>
            <div className="ticket-subject-container">
                <div>
                    <img src={BackArrow} onClick={handleClose}/>
                    <h1>{ticketData.subject}</h1>
                </div>
                <button className="resolve" onClick={resolve}>Resolve</button>
            </div>
            <div className="ticket-content-container">
                <table>
                    <thead>
                        <tr>
                            <th>id</th>
                            <th>name</th>
                            <th>email</th>
                            <th>timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="ticket-table-id">{ticketData.id}</td>
                            <td>{ticketData.name}</td>
                            <td className="ticket-table-email">{ticketData.email}</td>
                            <td className="ticket-table-timestamp">{ticketData.timestamp}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="ticket-message-container">
                <div>
                    <h1>Message</h1>
                    <p>{ticketData.message}</p>
                </div>
            </div>
        </>
    )
}

export default Ticket