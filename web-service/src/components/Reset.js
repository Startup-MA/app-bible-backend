import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"

import { Link } from "react-router"

import Error from "../components/Error.js"
import Loader from "../components/Loader.js"
import Verification  from "../components/Verification.js"

import "../styles/ResetModal.css"

import FormClose from "../assets/FormClose.svg"
import Close from "../assets/Close.svg"
import Google from "../assets/Google.svg"
import OpenedEye from "../assets/OpenedEye.svg"
import ClosedEye from "../assets/ClosedEye.svg"

import axios from "axios"

import { handleInputChange } from "../utils/handleInputChange"

function Reset({isOpen, onClose}) {
    const [isLoaded, setIsLoaded] = useState(true)
    const [error, setError] = useState({})
    const [isError, setIsError] = useState(false)
    const [email, setEmail] = useState("")
    const [validationError, setValidationError] = useState("")
    const [emailInvalid, setEmailInvalid] = useState(false)
    const [isLinkSent, setIsLinkSent] = useState(false)

    const dialogRef = useRef(null)

    const handleClose = () => {
        onClose()
        setEmail("")
        setValidationError("")
        setEmailInvalid(false)
        setIsLinkSent(false)
        setIsLoaded(true)
    }

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
            resetHandler()
        }
    }

    const resetHandler = () => {
        setEmailInvalid(false)
        setValidationError("")

        if (validateForm()) {
            setIsLoaded(false)
            axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/pass/forgot`, {
                email: email,
            })
            .then(data => {
                setValidationError("")
                setIsLinkSent(true)
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
                        if (error.response.data.errors[0].path === "email") {
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
                className="pop-up-background" id="Reset"
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
                    <h1>Reset</h1>
                    {isLoaded ? (
                        isLinkSent ? (
                            <p className="reset-link-sent">Password reset link sent.</p>
                        ) : (
                            <>
                                { validationError ? (
                                    <p className="validation-error-message">{validationError}</p>
                                ) : (
                                    <></>
                                ) }
                                <div className="auth-form-inputs">
                                    <input onKeyDown={handleEnter} style={emailInvalid ? {border: "1px solid #E04343"} : {}} type="email" value={email} placeholder="email" onChange={handleInputChange(setEmail)} />
                                </div>
                                <div className="auth-form-controlls">
                                    <button onClick={resetHandler}>
                                        Send
                                    </button>
                                    <p className="reset-modal-content">We will send to you a password reset link.</p>
                                </div>
                            </>
                        )
                    ) : (
                        <Loader height={"50vh"}/>
                    )}
                </div>
            </dialog>
        </>,
        document.getElementById("modal-root") 
    )
}

export default Reset