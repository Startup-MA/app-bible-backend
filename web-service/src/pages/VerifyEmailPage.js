import { useState, useEffect } from "react"
import { Link, useParams } from "react-router"
import { useNavigate } from "react-router-dom"

import Header from "../components/Header.js"
import Footer from "../components/Footer.js"
import Error from "../components/Error.js"
import Loader from "../components/Loader.js"
import SignUp from "../components/SignUp.js"
import Login from "../components/Login.js"
import Reset from "../components/Reset.js"
import HiddenEmailVerification from "../components/HiddenEmailVerification.js"

import "../styles/VerifyEmailPage.css"

import axios from "axios"

import { handleInputChange } from "../utils/handleInputChange.js"

function VerifyEmailPage() {
    const { uuid } = useParams()

    const [isAdmin, setIsAdmin] = useState(false)
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
    const [email, setEmail] = useState("")
    const [emailInvalid, setEmailInvalid] = useState(false)
    const [validationError, setValidationError] = useState("")
    const [allowVerification, setAllowVerification] = useState(false)

    const [error, setError] = useState({})
    const [isError, setIsError] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const [isLogin, setIsLogin] = useState(false)
    const [isReset, setIsReset] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)
    
    const navigate = useNavigate()

    const validateForm = () => {
        if (!email) {
            setValidationError("Email cannot be empty.")
            setEmailInvalid(true)
            return 0
        }

        return 1
    }

    const handleEnter = (event)=> {
        if (event.keyCode === 13) {
            sendEmail()
        }
    }

    const sendEmail = () => {
        setEmailInvalid(false)
        setValidationError("") 
        if (validateForm()) {
            setIsLoaded(false)
            axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/hiddenEmailVerify/${uuid}`, {
                email: email
            }, {
                withCredentials: true
            })
            .then(data => {

                if (data.data.message === "Logged in successfully") return navigate("/dashboard/profile")
                
                setValidationError("")
                setAllowVerification(true)
                setIsLoaded(true)
            })
            .catch(error => {
                setIsLoaded(true)
    
                if (axios.isCancel?.(error) || error.name === "CanceledError") return
    
                if (error.response) {
                    if (process.env.REACT_APP_NODE_ENV === "development" || error.response.status === 429) {
                        setError(`Error response: ${error.response.status} ${error.response.statusText}`)
                        setIsError(true)
                    }

                    if (error.response.data.errors) {
                        setValidationError(error.response.data.errors[0].message)

                        if (error.response.data.errors[0].email === "email") {
                            setEmailInvalid(true)
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

    const authMe = async (controller = {}) => {
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/authMe`, {
                signal: controller.signal,
                withCredentials: true
            }
        ).then(data => {
            return navigate("/dashboard/profile")
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
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/profile`, {
                signal: controller.signal,
                withCredentials: true
            }
        ).then(data => {
            return navigate("/dashboard/profile")
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

        authMe(controller)
        getProfile(controller)

        return () => controller.abort()
    }, [])

    return (
        <>
            <Reset isOpen={isReset} onClose={() => setIsReset(false)}/>
            <SignUp isOpen={isSignUp} setIsSignUp={setIsSignUp} setIsLogin={setIsLogin} onClose={() => setIsSignUp(false)}/>
            <Login isOpen={isLogin} setIsLogin={setIsLogin} setIsSignUp={setIsSignUp} setIsReset={setIsReset} onClose={() => setIsLogin(false)}/>
            <Header isAdmin={isAdmin} isUserLoggedIn={isUserLoggedIn} setIsSignUp={setIsSignUp} setIsLogin={setIsLogin}/>
            { isError ? (
                <Error message={error} cancelMessage={setIsError}/>
            ) : (
                <></>
            )}
            { isLoaded ? (
                <>
                    <div className="verifyEmail-content">
                        <div className="verifyEmail-form-content">
                            <h1>Email Verification</h1>
                            { allowVerification ? (
                                <HiddenEmailVerification 
                                    email={email}
                                    setAllowVerification={setAllowVerification} 
                                    setError={setError}
                                    setIsError={setIsError}
                                />
                            ) : (
                                <>
                                    { validationError ? (
                                        <p className="validation-error-message">{validationError}</p>
                                    ) : (
                                        <p className="verifyEmail-info-message">
                                            Provide us your email in order to approve it.
                                        </p>
                                    ) }
                                    <div className="verifyEmail-inputs">
                                        <div className="verifyEmail-container">
                                            <input onKeyDown={handleEnter} style={emailInvalid ? {border: "1px solid #E04343"} : {}} type="email" value={email} placeholder="email" onChange={handleInputChange(setEmail)} />
                                        </div>
                                    </div>
                                    <div className="verifyEmail-controlls">
                                        <button onClick={sendEmail}>
                                            Send
                                        </button>
                                    </div>
                                </>
                            )}
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

export default VerifyEmailPage