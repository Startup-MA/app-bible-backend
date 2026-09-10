import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useParams } from "react-router"

import Loader from "../components/Loader.js"

import BackArrow from "../assets/BackArrow.svg"
import Paste from "../assets/Paste.png"

import axios from "axios"

import "../styles/Verification.css"

function HiddenEmailVerification({email, setAllowVerification, setError, setIsError}) {
    const { uuid } = useParams()

    const [isLoaded, setIsLoaded] = useState(true)
    const [code, setCode] = useState(new Array(6).fill(""))
    const [validationError, setValidationError] = useState("")
    const [requestWent, setRequestWent] = useState(false)
    let [againAfter, setAgainAfter] = useState(30)
    const [isResendCode, setIsResendCode] = useState(false)
    const inputsRef = useRef([])

    const navigate = useNavigate()

    let resendCountdwonIntervalId

    const resendCountdown = () => {
        if (againAfter > 1) {
            setAgainAfter(--againAfter)
        } else if (againAfter == 1) {
            setAgainAfter(--againAfter)
            clearInterval(resendCountdwonIntervalId)
            setIsResendCode(false)
            setAgainAfter(30)
        }
    }

    const handleBackwards = () => {
        setIsLoaded(true)
        setAllowVerification(false)
    }
    
    const verifyCode = () => {
        if (!requestWent) {
            setIsLoaded(false)
            setRequestWent(true)

            axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/hiddenEmailCodeVerify/${uuid}`, {
                email: email,
                verCode: code.join(""),
            }, {
                withCredentials: true
            })
            .then(data => {
                setIsLoaded(true)
                return navigate("/dashboard/profile")
            })
            .catch(error => {
                setIsLoaded(true)

                if (axios.isCancel?.(error) || error.name === "CanceledError") return

                if (error.response) {
                    if (process.env.REACT_APP_NODE_ENV === "development" || error.response.status === 429) {
                        setError(`Error response: ${error.response.status} ${error.response.statusText}`)
                        setIsError(true)
                    }

                    setValidationError(error.response.data.message)
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

    const handleResend = () => {        
        axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/hiddenEmailCodeReset/${uuid}`, {
            email: email
        })
        .then(data => {
            setIsResendCode(true)
            resendCountdwonIntervalId = setInterval(resendCountdown, 1000)
        })
        .catch(error => {
            setIsLoaded(true)

            if (axios.isCancel?.(error) || error.name === "CanceledError") return

            if (error.response) {
                if (process.env.REACT_APP_NODE_ENV === "development" || error.response.status === 429) {
                    setError(`Error response: ${error.response.status} ${error.response.statusText}`)
                    setIsError(true)
                }

                setValidationError(error.response.data.message)
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

    const handleChange = (e, index) => {
        setRequestWent(false)
        setValidationError(false)
        
        const value = e.target.value
        
        // Stop immediately if they typed a letter or symbol
        if (!/^[0-9]*$/.test(value)) return

        // --- THE GBOARD / AUTOFILL FIX ---
        // If the value is longer than 2 characters, it means the mobile keyboard 
        // just pasted the whole code into this single box.
        if (value.length > 2) {
            const numbers = value.slice(0, 6)
            
            setCode((prevCode) => {
                const newCode = [...prevCode]
                // Distribute the pasted numbers starting from the very first box
                for (let i = 0; i < numbers.length; i++) {
                    newCode[i] = numbers[i]
                }
                return newCode
            })

            // Move focus to the correct box after auto-filling
            const focusIndex = numbers.length < 6 ? numbers.length : 5
            if (inputsRef.current[focusIndex]) {
                inputsRef.current[focusIndex].focus()
            }

            return // Stop here so we don't run the single-digit logic below
        }

        // --- NORMAL SINGLE-DIGIT TYPING LOGIC ---
        const digit = value.slice(-1)
        
        setCode((prevCode) => {
            const newCode = [...prevCode]

            newCode[index] = digit

            return newCode
        })

        // Auto-advance focus if they typed a number
        if (digit !== "" && index < 5) {
            inputsRef.current[index + 1].focus()
        }

    }

    const handleKeyDown = (e, index) => {
        // Auto-retreat: If they hit Backspace and the current box is already empty, 
        // move focus back to the previous box
        if (e.key === "Backspace" && code[index] === "" && index > 0) {
            inputsRef.current[index - 1].focus()
        }
    }

    const handleButtonPaste = async () => {
        try {
            // 1. Ask the browser to read the clipboard. 
            // This 'await' pauses the code until the user clicks "Allow" on the popup.
            const pastedData = await navigator.clipboard.readText()
            
            if (!pastedData) return

            // 2. Clean the data (strip letters, keep max 6 numbers)
            const numbers = pastedData.replace(/\D/g, "").slice(0, 6)
            
            if (!numbers) {
                return
            }

            // 3. Update the state to fill the boxes
            setCode((prevCode) => {
                const newCode = [...prevCode]

                for (let i = 0; i < numbers.length; i++) {
                    newCode[i] = numbers[i]
                }

                return newCode
            })

            // 4. Move focus to the correct box
            const focusIndex = numbers.length < 6 ? numbers.length : 5

            if (inputsRef.current[focusIndex]) {
                inputsRef.current[focusIndex].focus()
            }

        } catch (err) {
            // If the user clicks "Deny" on the permission popup, it throws an error.
            console.error("Clipboard access denied or failed", err)
            alert("Please allow clipboard access to use this feature, or type the code manually.")
        }
    }

    if (code.filter((item) => Number(item) || item === "0").length == 6) {
        verifyCode()
    }

    useEffect(() => {
        const handleGlobalPaste = (e) => {
            setRequestWent(false)
            setValidationError(false)

            const pastedData = e.clipboardData?.getData("text")
            if (!pastedData) return

            // Extract only numbers and limit to 6 digits
            const numbers = pastedData.replace(/\D/g, "").slice(0, 6)
            
            // If no numbers were found, do nothing
            if (!numbers) return

            e.preventDefault()

            // Update the 6 boxes
            setCode((prevCode) => {
                const newCode = [...prevCode]
                for (let i = 0; i < numbers.length; i++) {
                    newCode[i] = numbers[i]
                }
                return newCode
            })

            // Automatically focus the correct box after pasting
            const focusIndex = numbers.length < 6 ? numbers.length : 5
            if (inputsRef.current[focusIndex]) {
                inputsRef.current[focusIndex].focus()
            }
        };

        // Attach to the whole document
        document.addEventListener("paste", handleGlobalPaste)

        // Cleanup listener on unmount
        return () => {
            document.removeEventListener("paste", handleGlobalPaste)
        }
    }, []) // Empty dependency array ensures this only mounts once

    return (
        <>
            <div className="back-arrow" onClick={handleBackwards}>
                <img src={BackArrow} />
            </div>
            {isLoaded ? (
                <>
                    <div className="verification-form-memo">
                        <p>We've sent a 6-digit code to you</p>
                        <img src={Paste} title="Paste" className="paste" onClick={handleButtonPaste} />
                    </div>
                    <div className="verification-form-container"> 
                        <div className="verification-form-inputs">
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputsRef.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={digit}
                                    onChange={(e) => handleChange(e, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                />
                            ))}
                        </div>
                        <div className="verification-form-validation" style={validationError ? {} : {visibility: "hidden"}}>
                            <p>{validationError}</p>
                        </div>
                        <div className="verification-form-resend">
                            <p>Didn't get a code?
                                {isResendCode ? (
                                    <span className="again-after"> Again in {againAfter}s</span>
                                ) : (
                                    <>
                                        <span onClick={handleResend}> <u>Resend</u></span>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                </>
            ) : (
                <Loader height={"50vh"}/>
            )}
        </>
    )
}

export default HiddenEmailVerification