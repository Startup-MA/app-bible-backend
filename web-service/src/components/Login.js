import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"

import { Link } from "react-router"

import Error from "../components/Error.js"

import Loader from "../components/Loader.js"
import Verification  from "../components/Verification.js"

import FormClose from "../assets/FormClose.svg"
import Close from "../assets/Close.svg"
import Google from "../assets/Google.svg"
import OpenedEye from "../assets/OpenedEye.svg"
import ClosedEye from "../assets/ClosedEye.svg"

import axios from "axios"

import { handleInputChange } from "../utils/handleInputChange"

function Login({isOpen, setIsLogin, setIsSignUp, setIsReset, onClose}) {
    const [isLoaded, setIsLoaded] = useState(true)
    const [error, setError] = useState({})
    const [isError, setIsError] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [validationError, setValidationError] = useState("")
    const [emailInvalid, setEmailInvalid] = useState(false)
    const [passwordInvalid, setPasswordInvalid] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [allowVerification, setAllowVerification] = useState(false)
    
    const dialogRef = useRef(null)

    const handleEye = () => {
        setShowPassword(!showPassword)
    }

    const handleClose = () => {
        onClose()
        setEmail("")
        setPassword("")
        setShowPassword(false)
        setAllowVerification(false)
        setValidationError("")
        setEmailInvalid(false)
        setPasswordInvalid(false)
        setIsLoaded(true)
    }

    const goToSignUp = () => {
        onClose()
        setIsSignUp(true)
        setEmail("")
        setPassword("")
        setShowPassword(false)
        setValidationError("")
        setEmailInvalid(false)
        setPasswordInvalid(false)
        setIsLoaded(true)
    }

    const goToReset = () => {
        onClose()
        setIsReset(true)
        setEmail("")
        setPassword("")
        setShowPassword(false)
        setValidationError("")
        setEmailInvalid(false)
        setPasswordInvalid(false)
        setIsLoaded(true)
    }

    const validateForm = () => {
        if (!email) {
            setValidationError("Email cannot be empty")
            setEmailInvalid(true)
            return 0
        }

        if (!password) {
            setValidationError("Password cannot be empty")
            setPasswordInvalid(true)
            return 0
        }

        return 1
    }

    const handleEnter = (event)=> {
        if (event.keyCode === 13) {
            loginHandler()
        }
    }

    const loginHandler = () => {
        setShowPassword(false)
        setEmailInvalid(false)
        setPasswordInvalid(false)
        setValidationError("") 

        if (validateForm()) {
            setIsLoaded(false)

            axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, {
                email: email,
                password: password
            })
            .then(data => {
                setIsLoaded(true)
                setValidationError("")
                setAllowVerification(true)
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
                        if (error.response.data.errors[0].path === "email") {
                            setEmailInvalid(true)
                        } else {
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

    useEffect(() => {
        const dialogNode = dialogRef.current

        if (!dialogNode) return

        if (isOpen) {
            dialogNode.showModal()
        } else {
            dialogNode.close()
        }
    }, [isOpen])
    
    if (!isOpen) return null

    return createPortal(
        <>
            <dialog
                ref={dialogRef}
                onClose={handleClose}
                className="pop-up-background" id="Login"
            >
                <div className="auth-form">
                    { isError ? (
                        <Error message={error} cancelMessage={setIsError}/>
                    ) : (
                        <></>
                    )}
                    <div className="auth-form-close">
                        <img src={FormClose} onClick={handleClose}/>
                    </div>
                    <h1>Login</h1>
                    {allowVerification ? (
                        <Verification
                            email={email}
                            password={password}
                            onClose={handleClose}
                            setAllowVerification={setAllowVerification} 
                            setError={setError}
                            setIsError={setIsError}
                        />
                    ) : (
                        isLoaded ? (
                            <>
                                { validationError ? (
                                    <p className="validation-error-message">{validationError}</p>
                                ) : (
                                    <></>
                                ) }
                                <div className="auth-form-inputs">
                                    <input onKeyDown={handleEnter} style={emailInvalid ? {border: "1px solid #E04343"} : {}} type="email" value={email} placeholder="email" onChange={handleInputChange(setEmail)} />
                                    <div className="password-container">
                                        <input onKeyDown={handleEnter} style={passwordInvalid ? {border: "1px solid #E04343"} : {}} type={ showPassword ? "text" : "password" } value={password} placeholder="password" onChange={handleInputChange(setPassword)} />
                                        { showPassword ? (
                                            <img src={ClosedEye} className="password-field-eye" onClick={handleEye}/>
                                        ) : (
                                            <img src={OpenedEye} className="password-field-eye" onClick={handleEye}/>
                                        )}
                                    </div>
                                </div>
                                <div className="auth-form-controlls">
                                    <button onClick={loginHandler}>
                                        Login
                                    </button>
                                    <button onClick={goToSignUp}>
                                        Sing up
                                    </button>
                                    <button>
                                        <img src={Google} />
                                        Continue with Google
                                    </button>
                                    <p>Forgot your password? <span onClick={goToReset}>Reset</span></p>
                                </div>
                            </>
                        ) : (
                            <Loader height={"50vh"}/>
                        )
                    )}
                </div>
            </dialog>
        </>,
        document.getElementById("modal-root") 
    )
}

export default Login