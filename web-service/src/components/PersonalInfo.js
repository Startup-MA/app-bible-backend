import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { createPortal } from "react-dom"

import Error from "../components/Error.js"
import Loader from "../components/Loader.js"

import "../styles/PersonalInfo.css"

import axios from "axios"

import { handleInputChange } from "../utils/handleInputChange"
import { countries } from "../utils/countries.js"

function PersonalInfo({isOpen, setIsSignUp, setIsLogin, onClose}) {
    const [isLoaded, setIsLoaded] = useState(true)
    const [error, setError] = useState({})
    const [isError, setIsError] = useState(false)
    const [name, setName] = useState("")
    const [surname, setSurname] = useState("")
    const [age, setAge] = useState("")
    const [sex, setSex] = useState("")
    const [country, setCountry] = useState("")
    const [validationError, setValidationError] = useState("")
    const [nameInvalid, setNameInvalid] = useState(false)
    const [surnameInvalid, setSurnameInvalid] = useState(false)
    const [ageInvalid, setAgeInvalid] = useState(false)
    const [sexInvalid, setSexInvalid] = useState(false)
    const [countryInvalid, setCountryInvalid] = useState(false)
    
    const dialogRef = useRef(null)

    const navigate = useNavigate()

    const handleClose = () => {
        onClose()
        setName("")
        setSurname("")
        setAge("")
        setSex("")
        setCountry("")
        setValidationError("")
        setNameInvalid(false)
        setSurnameInvalid(false)
        setAgeInvalid(false)
        setSexInvalid(false)
        setCountryInvalid(false)
        setIsLoaded(true)
    }

    const validateForm = () => {
        if (!name.trim()) {
            setValidationError("Name cannot be empty")
            setNameInvalid(true)
            return 0
        }

        if (!surname.trim()) {
            setValidationError("Surname cannot be empty")
            setSurnameInvalid(true)
            return 0
        }

        if (!sex) {
            setValidationError("Sex cannot be empty")
            setSexInvalid(true)
            return 0
        }

        if (!age) {
            setValidationError("Age cannot be empty")
            setAgeInvalid(true)
            return 0
        }

        if (!country) {
            setValidationError("Country cannot be empty")
            setCountryInvalid(true)
            return 0
        }

        return 1
    }

    const handleEnter = (event) => {
        if (event.keyCode === 13) {
            updateProfile()
        }
    }

    const skipPersonalInfo = () => {
        setIsLoaded(false)
        setNameInvalid(false)
        setSurnameInvalid(false)
        setAgeInvalid(false)
        setSexInvalid(false)
        setCountryInvalid(false)
        setValidationError(false)

        axios.patch(`${process.env.REACT_APP_BACKEND_URL}/api/user/skipPersonalInfo`,
            {},
            {
                withCredentials: true
            }
        ).then(data => {
            handleClose()
            setIsLoaded(true)
        }).catch(error => {
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

    const updateProfile = () => {
        setNameInvalid(false)
        setSurnameInvalid(false)
        setAgeInvalid(false)
        setSexInvalid(false)
        setCountryInvalid(false)
        setValidationError(false)

        if (validateForm()) {
            setIsLoaded(false)

            axios.patch(`${process.env.REACT_APP_BACKEND_URL}/api/user/updateProfile`,
                {
                    name: name,
                    surname: surname,
                    age: age,
                    sex: sex,
                    country: country,
                    occurredAt: new Date().toISOString()
                },
                {
                    withCredentials: true
                }
            ).then(data => {
                setIsLoaded(true)
                handleClose()
                return navigate(0)
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
                            case "surname":
                                setSurnameInvalid(true)
                                break
                            case "sex":
                                setSexInvalid(true)
                                break
                            case "age":
                                setAgeInvalid(true)
                                break
                            case "country":
                                setCountryInvalid(true)
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
                className="pop-up-background" id="PersonalInfo"
            >
                <div className="auth-form">
                    { isError ? (
                        <Error message={error} cancelMessage={setIsError}/>
                    ) : (
                        <></>
                    )}
                    <div className="personal-info-title">
                        <h1>Personal Info</h1>
                        { validationError ? (
                            <></>
                        ) : (
                            <p>Let us know a little bit more about you.</p>
                        ) }
                    </div>
                    {isLoaded ? (
                        <>
                            { validationError ? (
                                <p className="personal-validation-error-message">{validationError}</p>
                            ) : (
                                <></>
                            ) }
                            <div className="auth-form-inputs personal-form">
                                <input style={nameInvalid ? {border: "1px solid #E04343"} : {}} onKeyDown={handleEnter} name="name" value={name} placeholder="name" onChange={handleInputChange(setName)}/>
                                <input style={surnameInvalid ? {border: "1px solid #E04343"} : {}} onKeyDown={handleEnter} name="surname" value={surname} placeholder="surname" onChange={handleInputChange(setSurname)}/>
                                <div className="sex-age-select">
                                    <select style={sexInvalid ? {border: "1px solid #E04343"} : {}} name="sex" value={sex} onChange={handleInputChange(setSex)} required>
                                        <option value="" disabled defaultValue hidden>sex</option>
                                        <option>M</option>
                                        <option>F</option>
                                    </select>
                                    <select value={age} style={ageInvalid ? {border: "1px solid #E04343"} : {}} name="age" onChange={handleInputChange(setAge)} required>
                                        <option value="" disabled defaultValue hidden>age</option>
                                        {[...Array(121).keys()].slice(1).map((item, index) => 
                                            <option key={index} value={item}>{item}</option>
                                        )}
                                    </select>
                                </div>
                                <select value={country} style={countryInvalid ? {border: "1px solid #E04343"} : {}} name="country" onChange={handleInputChange(setCountry)} required>
                                    <option value="" disabled defaultValue hidden>country</option>
                                    {countries.map((item, index) => 
                                        <option key={index} code={item.code} value={item.name}>{item.name}</option>
                                    )}
                                </select>
                            </div>
                            <div className="auth-form-controlls personal-form">
                                <button onClick={updateProfile}>
                                    Send
                                </button>
                                <button onClick={skipPersonalInfo}>
                                    I skip it for now
                                </button>
                            </div>
                        </>
                    ) : (
                        <Loader height={"60vh"} />
                    )}
                </div>
            </dialog>
        </>,
        document.getElementById("modal-root") 
    )
}

export default PersonalInfo