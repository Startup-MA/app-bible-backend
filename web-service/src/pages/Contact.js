import { useState, useEffect, useRef } from "react"
import { Link } from "react-router"
import { HashLink } from "react-router-hash-link"

import axios from "axios"

import Header from "../components/Header.js"
import Footer from "../components/Footer.js"
import Loader from "../components/Loader.js"
import Error from "../components/Error.js"
import SignUp from "../components/SignUp.js"
import Login from "../components/Login.js"
import Reset from "../components/Reset.js"
import PersonalInfo from "../components/PersonalInfo.js"

import X from "../assets/X.svg"
import Telegram from "../assets/Telegram.svg"

import "../styles/Contact.css"

import { handleInputChange } from "../utils/handleInputChange.js"

function Contact() {
    const targetRef = useRef(null)

    const [isAdmin, setIsAdmin] = useState(false)
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
    const [error, setError] = useState({})
    const [isError, setIsError] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const [isLogin, setIsLogin] = useState(false)
    const [isReset, setIsReset] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)
    const [isPersonalInfo, setIsPersonalInfo] = useState(false)

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [subject, setSubject] = useState("")
    const [message, setMessage] = useState("")

    const [validationError, setValidationError] = useState("")
    const [nameInvalid, setNameInvalid] = useState(false)
    const [emailInvalid, setEmailInvalid] = useState(false)
    const [subjectInvalid, setSubjectInvalid] = useState(false)
    const [messageInvalid, setMessageInvalid] = useState(false)


    const [isSuccess, setIsSuccess] = useState(false)

    const clearTicket = () => {
        setName("")
        setEmail("")
        setSubject("")
        setMessage("")

        setNameInvalid(false)
        setEmailInvalid(false)
        setSubjectInvalid(false)
        setMessageInvalid(false)

        setValidationError("")
    }

    const validateForm = () => {
        if (!name) {
            setValidationError("Name cannot be empty")
            setNameInvalid(true)
            return 0
        }

        if (!email) {
            setValidationError("Email cannot be empty")
            setEmailInvalid(true)
            return 0
        }

        if (!subject) {
            setValidationError("Subject cannot be empty")
            setSubjectInvalid(true)
            return 0
        }

        if (!message) {
            setValidationError("Message cannot be empty")
            setMessageInvalid(true)
            return 0
        }

        return 1
    }

    const createTicket = () => {
        setNameInvalid(false)
        setEmailInvalid(false)
        setSubjectInvalid(false)
        setMessageInvalid(false)
        setValidationError(false)
        setIsSuccess(false)

        if (validateForm()) {
            setIsLoaded(false)
            axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/sys/createTicket`,
                {
                    name: name,
                    email: email,
                    subject: subject,
                    message: message,
                    timestamp: new Date().toISOString()
                }
            ).then(data => {
                setIsSuccess(true)
                clearTicket()
                setIsLoaded(true)
                window.scroll(0, 0)
            }).catch(error => {

                setIsLoaded(true)

                if (axios.isCancel?.(error) || error.name === "CanceledError") return

                if (error.response) {
                    if (process.env.REACT_APP_NODE_ENV === "development" || error.response.status === 429) {
                        setError(`Error response: ${error.response.status} ${error.response.statusText}`)
                        setIsError(true)
                    }

                    if (error.response.data.errors) {
                        setValidationError(error.response.data.errors[0].message)

                        switch (error.response.data.errors[0].path) {
                            case "name": 
                                setNameInvalid(true)
                                break
                            case "email":
                                setEmailInvalid(true)
                                break
                            case "subject":
                                setSubjectInvalid(true)
                                break
                            case "message":
                                setMessageInvalid(true)
                                break
                            default:
                        }

                    } else {
                        setValidationError(error.response.data.message)
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
    }

    const getProfile = async (controller = {}) => {
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/profile`, {
                signal: controller.signal,
                withCredentials: true
            }
        ).then(data => {
            setIsUserLoggedIn(true)
            setIsPersonalInfo(!data.data.data[0].personal_info)
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
        window.scrollTo(0, 0)

        const controller = new AbortController()

        getProfile(controller)

        return () => controller.abort()
    }, [])

    console.log(process.env.REACT_APP_SUPPORT_EMAIL)

    return (
        <>
            <PersonalInfo isOpen={isPersonalInfo} onClose={() => setIsPersonalInfo(false)} />
            <Reset isOpen={isReset} onClose={() => setIsReset(false)}/>
            <SignUp isOpen={isSignUp} setIsSignUp={setIsSignUp} setIsLogin={setIsLogin} onClose={() => setIsSignUp(false)}/>
            <Login isOpen={isLogin} setIsLogin={setIsLogin} setIsSignUp={setIsSignUp} setIsReset={setIsReset} onClose={() => setIsLogin(false)}/>
            <Header isAdmin={isAdmin} isUserLoggedIn={isUserLoggedIn} currentPage={"contact"} setIsSignUp={setIsSignUp} setIsLogin={setIsLogin}/>
            {isError ? (
                <Error message={error} cancelMessage={setIsError}/>
            ) : (
                <></>
            )}
            {isLoaded ? (
                <>
                    <div className="contact-content">
                        <div className="support">
                            <div>
                                <p>Prefer email?</p>
                                <p>{process.env.REACT_APP_SUPPORT_EMAIL}</p>
                            </div>
                            <div>
                                <p>Need a quick answer?</p>
                                <p>You might find what you're<br/> looking for in our <HashLink to="/pricing#FAQs">FAQs</HashLink>.</p>
                            </div>
                        </div>
                        <div className="contact">
                            <div className="contact-section" ref={targetRef}>
                                <p>Leave us your request</p>
                                <p>No bots here — just a few developers and a lot of tea. We promise a human will read your message as soon as possible!</p>
                                { validationError ? (
                                    <p className="ticket-validation-error">{validationError}</p>
                                ) : (
                                    <></>
                                ) }
                                { isSuccess ? (
                                    <p className="create-ticket-success">Your message is accepted!</p>
                                ) : (
                                    <></>
                                ) }
                                <div className="contact-form">
                                    <div>
                                        <input style={nameInvalid ? {border: "1px solid #E04343"} : {}} value={name} name="name" placeholder="Name" onChange={handleInputChange(setName)} />
                                    </div>
                                    <div>
                                        <input style={emailInvalid ? {border: "1px solid #E04343"} : {}} value={email} name="email" type="email" placeholder="Email" onChange={handleInputChange(setEmail)} />
                                    </div>
                                    <div>
                                        <select style={subjectInvalid ? {border: "1px solid #E04343"} : {}} value={subject} name="subject" onChange={handleInputChange(setSubject)} required>
                                            <option value="" disabled selected hidden>Subject</option>
                                            <option>Subscription</option>
                                            <option>How to</option>
                                            <option>System bug</option>
                                            <option>Partnership</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <textarea style={messageInvalid ? {border: "1px solid #E04343"} : {}} value={message} name="problem" placeholder="How can we help?" onChange={handleInputChange(setMessage)} />
                                    </div>
                                    <div className="buttons">
                                        <button onClick={clearTicket}>Clear</button>
                                        <button onClick={createTicket}>Send</button>
                                    </div>
                                </div>
                            </div>
                            <div className="contact-section">
                                <p>
                                    Follow us
                                </p>
                                <div className="socials">
                                    <Link ><img src={X} alt="X"/></Link>
                                    <Link ><img src={Telegram} alt="Telegram"/></Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <Loader />
            )}
            <Footer />
        </>
    )
}

export default Contact