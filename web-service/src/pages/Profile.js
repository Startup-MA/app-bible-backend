import { useState, useEffect } from "react"
import { Link, useAsyncError } from "react-router"
import { useNavigate } from "react-router-dom"

import Header from "../components/Header.js"
import Footer from "../components/Footer.js"
import Error from "../components/Error.js"
import Loader from "../components/Loader.js"
import SignUp from "../components/SignUp.js"
import Login from "../components/Login.js"
import Reset from "../components/Reset.js"
import PersonalInfo from "../components/PersonalInfo.js"

import axios from "axios"

import "../styles/Profile.css"

import { handleInputChange } from "../utils/handleInputChange"

import { countries } from "../utils/countries.js"

function Profile() {
    const [isAdmin, setIsAdmin] = useState(false)
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
    const [userData, setUserData] = useState(false)
    const [userProfile, setUserProfile] = useState(false)
    const [error, setError] = useState({})
    const [isError, setIsError] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const [isLogin, setIsLogin] = useState(false)
    const [isReset, setIsReset] = useState(false)
    const [isPersonalInfo, setIsPersonalInfo] = useState(false)
    const [validationError, setValidationError] = useState("")
    const [nameInvalid, setNameInvalid] = useState(false)
    const [surnameInvalid, setSurnameInvalid] = useState(false)
    const [ageInvalid, setAgeInvalid] = useState(false)
    const [sexInvalid, setSexInvalid] = useState(false)
    const [countryInvalid, setCountryInvalid] = useState(false)
    const [updateRequired, setUpdateRequired] = useState(true)

    const [name, setName] = useState("")
    const [surname, setSurname] = useState("")
    const [age, setAge] = useState("")
    const [sex, setSex] = useState("")
    const [country, setCountry] = useState("")
    const [personalInfo, setPersonalInfo] = useState(false)
    const [edited, setEdited] = useState(false)
    
    const handleEnter = (event) => {
        if (event.keyCode === 13) {
            handleSave()
        }
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

        if (!age) {
            setValidationError("Age cannot be empty")
            setAgeInvalid(true)
            return 0
        }

        if (!sex) {
            setValidationError("Sex cannot be empty")
            setSexInvalid(true)
            return 0
        }

        if (!country) {
            setValidationError("Country cannot be empty")
            setCountryInvalid(true)
            return 0
        }

        return 1
    }

    const handleCancel = () => {
        setName(userProfile.name ? userProfile.name : "")
        setSurname(userProfile.surname ? userProfile.surname : "")
        setSex(userProfile.sex ? userProfile.sex : "")
        setCountry(userProfile.country ? userProfile.country : "")
        setAge(userProfile.age ? userProfile.age : "")
        setEdited(false)
        setNameInvalid(false)
        setSurnameInvalid(false)
        setAgeInvalid(false)
        setSexInvalid(false)
        setCountryInvalid(false)
        setValidationError(false)
    }

    const handleSave = () => {
        updateProfile()
    }

    const onInputChange = (e, setState) => {
        handleInputChange(setState)(e)

        if (
            (e.target.attributes.name.value === "name" && e.target.value !== userProfile.name) ||
            (e.target.attributes.name.value === "surname" && e.target.value !== userProfile.surname) ||
            (e.target.attributes.name.value === "age" && e.target.value != userProfile.age) ||
            (e.target.attributes.name.value === "sex" && e.target.value !== userProfile.sex) ||
            (e.target.attributes.name.value === "country" && e.target.value !== userProfile.country)

        ) {
            setEdited(true)
            return
        }

        setEdited(false)
        setNameInvalid(false)
        setSurnameInvalid(false)
        setAgeInvalid(false)
        setSexInvalid(false)
        setCountryInvalid(false)
        setValidationError(false)
    }

    const handleLogin = () => {
        setIsLogin(true)
    }

    const navigate = useNavigate();

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
                setUserProfile({
                    name: name.trim(),
                    surname: surname.trim(),
                    age: age,
                    sex: sex,
                    country: country
                })
                setName(name.trim())
                setSurname(surname.trim())
                setUpdateRequired(false)
                setIsLoaded(true)
                setEdited(false)
            }).catch(error => {
                setIsLoaded(true)

                if (axios.isCancel?.(error) || error.name === "CanceledError") return

                if (error.response) {
                    if (process.env.REACT_APP_NODE_ENV === "development" || error.response.status === 429) {
                        setError(`Server error: ${error.response.status} ${error.response.statusText}`)
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

    const handleLogout = () => {
        setIsLoaded(false)

        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/auth/logout`, {
                withCredentials: true
            }
        ).then(data => {
            setIsLoaded(true)
            return navigate("/")
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

    const authMe = async (controller = {}) => {
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/authMe`, {
                signal: controller.signal,
                withCredentials: true
            }
        ).then(data => {
            window.scrollTo(0, 0)
            setIsUserLoggedIn(true)
            setUserData(data.data.data[0])
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
            setIsPersonalInfo(!data.data.data[0].personal_info)
            setUserProfile(data.data.data[0])
            setName(data.data.data[0].name ? data.data.data[0].name : "")
            setSurname(data.data.data[0].surname ? data.data.data[0].surname : "")
            setSex(data.data.data[0].sex ? data.data.data[0].sex : "")
            setCountry(data.data.data[0].country ? data.data.data[0].country : "")
            setAge(data.data.data[0].age ? data.data.data[0].age : "")
            setUpdateRequired(data.data.data[0].name ? false : true)
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
            <PersonalInfo isOpen={isPersonalInfo} onClose={() => setIsPersonalInfo(false)} />
            <Reset isOpen={isReset} onClose={() => setIsReset(false)}/>
            <SignUp isOpen={isSignUp} setIsSignUp={setIsSignUp} setIsLogin={setIsLogin} onClose={() => setIsSignUp(false)}/>
            <Login isOpen={isLogin} setIsLogin={setIsLogin} setIsSignUp={setIsSignUp} setIsReset={setIsReset} onClose={() => setIsLogin(false)}/>
            <Header isAdmin={isAdmin} isUserLoggedIn={isUserLoggedIn} hideElement={"signin"} setIsSignUp={setIsSignUp} setIsLogin={setIsLogin}/>
            {isError ? (
                <Error message={error} cancelMessage={setIsError}/>
            ) : (
                <></>
            )}
            {isLoaded ? (!isUserLoggedIn ? (
                    <div className="request-content">
                        <div className="request">
                            <h1>You are not signed in</h1>
                            <button onClick={handleLogin}>Sign In</button>
                        </div>
                    </div>
                ) : (
                    <div className="profile-content">
                        <div className="panel">
                            <div>
                                <Link to="/dashboard/profile" style={{color: "black"}}>Profile</Link>
                            </div>
                            <div>
                                <Link to="/dashboard/billing">Billing</Link>
                            </div>
                        </div>
                        <div className="info">
                            <div className="personal">
                                <div>
                                    <h1>Email</h1>
                                    <p>{userData.email}</p>
                                </div>
                                <div className="form-container">
                                    <div className="personal-info">
                                        <h1>Personal Info</h1>
                                        {updateRequired ? (
                                            <p>(Update Required)</p>
                                        ) : (
                                            <></>
                                        )}
                                    </div>
                                    { validationError ? (
                                        <p className="profile-validation-error-message">{validationError}</p>
                                    ) : (
                                        <></>
                                    ) }
                                    <div className="form">
                                        <div>
                                            <input style={nameInvalid ? {border: "1px solid #E04343"} : {}} onKeyDown={handleEnter} name="name" value={name} placeholder="name" onChange={event => onInputChange(event, setName)}/>
                                            <input style={surnameInvalid ? {border: "1px solid #E04343"} : {}} onKeyDown={handleEnter} name="surname" value={surname} placeholder="surname" onChange={event => onInputChange(event, setSurname)}/>
                                            <select style={sexInvalid ? {border: "1px solid #E04343"} : {}} name="sex" value={sex} onChange={event => onInputChange(event, setSex)} required>
                                                <option value="" disabled defaultValue hidden>sex</option>
                                                <option>M</option>
                                                <option>F</option>
                                            </select>
                                            <select value={age} style={ageInvalid ? {border: "1px solid #E04343"} : {}} name="age" onChange={event => onInputChange(event, setAge)} required>
                                                <option value="" disabled defaultValue hidden>age</option>
                                                {[...Array(121).keys()].slice(1).map((item, index) => 
                                                    <option key={index} value={item}>{item}</option>
                                                )}
                                            </select>
                                            <select value={country} style={countryInvalid ? {border: "1px solid #E04343"} : {}} name="country" onChange={event => onInputChange(event, setCountry)} required>
                                                <option value="" disabled defaultValue hidden>country</option>
                                                {countries.map((item, index) => 
                                                    <option key={index} code={item.code} value={item.name}>{item.name}</option>
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="edit-buttons" style={edited ? {} : {visibility: "hidden"}}>
                                        <button onClick={handleCancel}>Cancel</button>
                                        <button onClick={handleSave}>Save</button>
                                    </div>
                                </div>
                            </div>
                            <div className="logout">
                                <button onClick={handleLogout}>Logout</button>
                            </div>
                        </div>
                    </div>
            )) : (
                <Loader />
            )}
            <Footer />
        </>
    )
}

export default Profile