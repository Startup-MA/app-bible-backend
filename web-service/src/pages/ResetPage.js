import { useState, useEffect } from "react"
import { Link, useParams } from "react-router"

import Header from "../components/Header.js"
import Footer from "../components/Footer.js"
import Error from "../components/Error.js"
import Loader from "../components/Loader.js"
import SignUp from "../components/SignUp.js"
import Login from "../components/Login.js"
import Reset from "../components/Reset.js"

import "../styles/ResetPage.css"

import OpenedEye from "../assets/OpenedEye.svg"
import ClosedEye from "../assets/ClosedEye.svg"

import axios from "axios"

import { handleInputChange } from "../utils/handleInputChange.js"

function ResetPage() {
    const { uuid } = useParams()

    const [isAdmin, setIsAdmin] = useState(false)
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [passwordInvalid, setPasswordInvalid] = useState(false)
    const [confirmPasswordInvalid, setConfirmPasswordInvalid] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [validationError, setValidationError] = useState("")
    const [isNewPassword, setIsNewPassword] = useState(false)

    const [error, setError] = useState({})
    const [isError, setIsError] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const [isLogin, setIsLogin] = useState(false)
    const [isReset, setIsReset] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)
    
    const handleEye = () => {
        setShowPassword(!showPassword)
    }

    const validateForm = () => {
        if (!password) {
            setValidationError("New password cannot be empty.")
            setPasswordInvalid(true)
            return 0
        }

        if (!confirmPassword) {
            setValidationError("Confirm your new password.")
            setConfirmPasswordInvalid(true)
            return 0
        }

        if (password !== confirmPassword) {
            setValidationError("Passwords do not match.")
            setConfirmPasswordInvalid(true)
            return 0
        }

        return 1
    }

    const handleEnter = (event)=> {
        if (event.keyCode === 13) {
            resetHandler()
        }
    }

    const resetHandler = () => {
        setShowPassword(false)
        setPasswordInvalid(false)
        setConfirmPasswordInvalid(false)
        setValidationError("") 
        if (validateForm()) {
            setIsLoaded(false)
            axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/pass/reset/${uuid}`, {
                new_password: password
            })
            .then(data => {
                setValidationError("")
                setIsNewPassword(true)
                setIsLoaded(true)
            })
            .catch(error => {
                setIsLoaded(true)
    
                if (axios.isCancel?.(error) || error.name === "CanceledError") return
    
                if (error.response) {
                    if (process.env.REACT_APP_NODE_ENV === "development" || error.response.status === 429) {
                        setError(`Server error: ${error.response.status} ${error.response.statusText}`)
                        setIsError(true)
                    }

                    if (error.response.data.errors) {
                        setValidationError(error.response.data.errors[0].message)

                        if (error.response.data.errors[0].path === "new_password") {
                            setPasswordInvalid(true)
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
            setIsUserLoggedIn(true)
            setIsLoaded(true)
        }).catch(error => {
            setIsLoaded(true)

            if (axios.isCancel?.(error) || error.name === "CanceledError") return

            if (error.response) {
                if (process.env.REACT_APP_NODE_ENV === "development" || error.response.status === 429) {
                    setError(`Server error: ${error.response.status} ${error.response.statusText}`)
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
            setIsUserLoggedIn(true)
            setIsAdmin(data.data.data[0].is_admin)
            setIsLoaded(true)
        }).catch(error => {
            setIsLoaded(true)

            if (axios.isCancel?.(error) || error.name === "CanceledError") return

            if (error.response) {
                if (process.env.REACT_APP_NODE_ENV === "development" || error.response.status === 429) {
                    setError(`Server error: ${error.response.status} ${error.response.statusText}`)
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
                    <div className="reset-content">
                        <div className="reset-form-content">
                            <h1>New Password</h1>
                            {isNewPassword ? (
                                <p className="reset-form-result">Your new password has been successfully set.</p>
                            ) : (
                                <>
                                    { validationError ? (
                                        <p className="validation-error-message">{validationError}</p>
                                    ) : (
                                        <></>
                                    ) }
                                    <div className="reset-inputs">
                                        <div className="password-container">
                                            <input onKeyDown={handleEnter} style={passwordInvalid ? {border: "1px solid #E04343"} : {}} type={ showPassword ? "text" : "password" } value={password} placeholder="new password" onChange={handleInputChange(setPassword)} />
                                            { showPassword ? (
                                                <img src={ClosedEye} className="password-field-eye" onClick={handleEye}/>
                                            ) : (
                                                <img src={OpenedEye} className="password-field-eye" onClick={handleEye}/>
                                            )}
                                        </div>
                                        <input onKeyDown={handleEnter} style={confirmPasswordInvalid ? {border: "1px solid #E04343"} : {}} type={ showPassword ? "text" : "password" } placeholder="confirm new password" onChange={handleInputChange(setConfirmPassword)}/>
                                    </div>
                                    <div className="reset-controlls">
                                        <button onClick={resetHandler}>
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

export default ResetPage