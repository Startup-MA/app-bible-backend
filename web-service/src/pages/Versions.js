import { useState, useEffect } from "react"

import axios from "axios"

import Header from "../components/Header.js"
import Footer from "../components/Footer.js"
import Loader from "../components/Loader.js"
import Error from "../components/Error.js"
import SignUp from "../components/SignUp.js"
import Login from "../components/Login.js"
import Reset from "../components/Reset.js"
import PopUp from "../components/PopUp.js"


import { handleInputChange } from "../utils/handleInputChange.js"

import "../styles/Versions.css"

function Version() {
    const defaultCurrentAppVersion = {
        android: {
            mrv: "",
            mxav: ""
        },
        ios: {
            mrv: "",
            mxav: ""
        }
    }
    
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
    const [error, setError] = useState({})
    const [isError, setIsError] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const [isLogin, setIsLogin] = useState(false)
    const [isReset, setIsReset] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [isPopUp, setIsPopUp] = useState(false)

    const [currentAppVersion, setCurrentAppVersion] = useState(defaultCurrentAppVersion)
    const [edited, setEdited] = useState(false)
    const [validationError, setValidationError] = useState("")

    const [amrvInvalid, setAmrvInvalid] = useState(false)
    const [amxavInvalid, setAmxavInvalid] = useState(false)
    const [imrvInvalid, setImrvInvalid] = useState(false)
    const [imxavInvalid, setImxavInvalid] = useState(false)

    const [amrv, setAmrv] = useState("")
    const [amxav, setAmxav] = useState("")
    const [imrv, setImrv] = useState("")
    const [imxav, setImxav] = useState("")

    const handleEnter = (event) => {
        if (event.keyCode === 13) {
            handleSave()
        }
    }

    const handlePopUpAction = (event) => {
        if (event.target.innerText === "Cancel") {
            setIsPopUp(false)
        } else {
            setIsPopUp(false)
            resolveAll()
        }
    }

    const handleLogin = () => {
        setIsLogin(true)
    }

    const handleCancel = () => {
        setAmrv(currentAppVersion.android.mrv ? currentAppVersion.android.mrv : "")
        setImrv(currentAppVersion.ios.mrv ? currentAppVersion.ios.mrv : "")
        setAmxav(currentAppVersion.android.mxav ? currentAppVersion.android.mxav : "")
        setImxav(currentAppVersion.ios.mxav ? currentAppVersion.ios.mxav : "")
        setEdited(false)
        setAmrvInvalid(false)
        setAmxavInvalid(false)
        setImrvInvalid(false)
        setImxavInvalid(false)
        setValidationError(false)
    }

    const handleSave = () => {
        updatedAppVersion()
    }

    const onInputChange = (e, setState) => {
        handleInputChange(setState)(e)

        if (
            (e.target.attributes.name.value === "amrv" && e.target.value !== currentAppVersion.android.mrv) ||
            (e.target.attributes.name.value === "amxav" && e.target.value !== currentAppVersion.android.mxav) ||
            (e.target.attributes.name.value === "imrv" && e.target.value != currentAppVersion.ios.mrv) ||
            (e.target.attributes.name.value === "imxav" && e.target.value !== currentAppVersion.ios.mxav)
        ) {
            setEdited(true)
            return
        }

        setEdited(false)
        setAmrvInvalid(false)
        setAmxavInvalid(false)
        setImrvInvalid(false)
        setImxavInvalid(false)
        setValidationError(false)
    }

    const validateForm = () => {
        if (!amrv.trim()) {
            setValidationError("Android MRV cannot be empty")
            setAmrvInvalid(true)
            return 0
        }

        if (!amxav.trim()) {
            setValidationError("Android MXAV cannot be empty")
            setAmxavInvalid(true)
            return 0
        }

        if (!imrv.trim()) {
            setValidationError("iOS MRV cannot be empty")
            setImrvInvalid(true)
            return 0
        }

        if (!imxav.trim()) {
            setValidationError("iOS MXAV cannot be empty")
            setImxavInvalid(true)
            return 0
        }

        return 1
    }

    const updatedAppVersion = () => {
        setAmrvInvalid(false)
        setAmxavInvalid(false)
        setImrvInvalid(false)
        setImxavInvalid(false)
        setValidationError(false)

        if (validateForm()) {
            setIsLoaded(false)
            axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/sys/updateAppVersion`,
                {
                    android: {
                        mrv: amrv.trim(),
                        mxav: amxav.trim()
                    },
                    ios: {
                        mrv: imrv.trim(),
                        mxav: imxav.trim()
                    }
                },
                {
                    withCredentials: true
                }
            ).then(data => {
                setCurrentAppVersion({
                    android: {
                        mrv: amrv.trim(),
                        mxav: amxav.trim()
                    },
                    ios: {
                        mrv: imrv.trim(),
                        mxav: amxav.trim()
                    }
                })
                setAmrv(amrv.trim())
                setAmxav(amxav.trim())
                setImrv(imrv.trim())
                setImxav(imxav.trim())
                setIsLoaded(true)
                setEdited(false)
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

    const getCurrentAppVersion = async (controller = {}) => {
        setIsLoaded(false)
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/sys/getCurrentAppVersion`, 
            {
                signal: controller.signal,
                withCredentials: true
            }
        ).then(data => {
            console.log(data)
            setCurrentAppVersion(data.data.data.length ? data.data.data[0].versions : defaultCurrentAppVersion)
            setAmrv(data.data.data[0]?.versions.android.mrv ? data.data.data[0].versions.android.mrv : "")
            setImrv(data.data.data[0]?.versions.ios.mrv ? data.data.data[0].versions.ios.mrv : "")
            setAmxav(data.data.data[0]?.versions.android.mxav ? data.data.data[0].versions.android.mxav : "")
            setImxav(data.data.data[0]?.versions.ios.mxav ? data.data.data[0].versions.ios.mxav : "")
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
        const controller = new AbortController()

        getProfile(controller)
        getCurrentAppVersion(controller)

        return () => controller.abort()
    }, [])

    return (
        <>
            <Reset isOpen={isReset} onClose={() => setIsReset(false)}/>
            <SignUp isOpen={isSignUp} setIsSignUp={setIsSignUp} setIsLogin={setIsLogin} onClose={() => setIsSignUp(false)}/>
            <Login isOpen={isLogin} setIsLogin={setIsLogin} setIsSignUp={setIsSignUp} setIsReset={setIsReset} onClose={() => setIsLogin(false)}/>
            <PopUp isOpen={isPopUp} onClose={() => setIsPopUp(false)} actionHandler={handlePopUpAction} title={"Deletion"} content={"All tickets from this page will be deleted. This changes are irreversible. \n\n Are you sure you want to proceed?"}/>
            <Header isAdmin={isAdmin} isUserLoggedIn={isUserLoggedIn} currentPage={"version"} setIsSignUp={setIsSignUp} setIsLogin={setIsLogin}/>
            { isError ? (
                <Error message={error} cancelMessage={setIsError}/>
            ) : (
                <></>
            )}
            { isLoaded ? (
                isUserLoggedIn ? (
                    isAdmin ? (
                        <div className="versions-content">
                            { validationError ? (
                                <p className="profile-validation-error-message">{validationError}</p>
                            ) : (
                                <></>
                            ) }
                            <div className="versions-table">
                                <div className="col-1">
                                    <h3>OS</h3>
                                    <p>Android</p>
                                    <p>iOS</p>    
                                </div>
                                <div className="col-2">
                                    <h3>MRV</h3>
                                    <input style={amrvInvalid ? {border: "1px solid #E04343"} : {}} onKeyDown={handleEnter} name="amrv" value={amrv} placeholder="0.0.0" onChange={event => onInputChange(event, setAmrv)}/>
                                    <input style={imrvInvalid ? {border: "1px solid #E04343"} : {}} onKeyDown={handleEnter} name="imrv" value={imrv} placeholder="0.0.0" onChange={event => onInputChange(event, setImrv)}/>
                                </div>
                                <div className="col-3">
                                    <h3>MXAV</h3>
                                    <input style={amxavInvalid ? {border: "1px solid #E04343"} : {}} onKeyDown={handleEnter} name="amxav" value={amxav} placeholder="0.0.0" onChange={event => onInputChange(event, setAmxav)}/>
                                    <input style={imxavInvalid ? {border: "1px solid #E04343"} : {}} onKeyDown={handleEnter} name="imxav" value={imxav} placeholder="0.0.0" onChange={event => onInputChange(event, setImxav)}/>
                                </div>
                            </div>
                            <div className="edit-buttons" style={edited ? {} : {visibility: "hidden"}}>
                                <button onClick={handleCancel}>Cancel</button>
                                <button onClick={handleSave}>Save</button>
                            </div>
                        </div>
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

export default Version