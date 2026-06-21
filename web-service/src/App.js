import { useState, useEffect } from "react"
import { Link } from "react-router"
import { HashLink } from "react-router-hash-link"

import axios from "axios"

import Header from "./components/Header.js"
import Error from "./components/Error.js"
import Loader from "./components/Loader.js"
import SignUp from "./components/SignUp.js"
import Login from "./components/Login.js"
import Reset from "./components/Reset.js"
import PersonalInfo from "./components/PersonalInfo.js"

import GenesisHome from "./assets/GenesisHome.svg"
import BibleInterface from "./assets/BibleInterface.svg"
import Noads from "./assets/No ads.svg"
import Thunder from "./assets/Thunder.svg"
import Audio from "./assets/Audio.svg"
import Planet from "./assets/Planet.svg"
import Free from "./assets/Free.svg"
import ArtGallery from "./assets/ArtGallery.svg"
import MarriageOfTheVirgine from "./assets/Marriage of the Virgin.png"
import Question from "./assets/Question.svg"
import Logo from "./assets/Logo.svg"
import GooglePlay from "./assets/GooglePlay.svg"
import Apple from "./assets/Apple.svg"

import "./styles/Home.css"

function App() {
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
    const [error, setError] = useState({})
    const [isError, setIsError] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const [isLogin, setIsLogin] = useState(false)
    const [isReset, setIsReset] = useState(false)
    const [isPersonalInfo, setIsPersonalInfo] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)

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

        getProfile(controller)
        
        return () => controller.abort()
    }, [])

    return (
        <>
            <PersonalInfo isOpen={isPersonalInfo} onClose={() => setIsPersonalInfo(false)} />
            <Reset isOpen={isReset} onClose={() => setIsReset(false)}/>
            <SignUp isOpen={isSignUp} setIsSignUp={setIsSignUp} setIsLogin={setIsLogin} onClose={() => setIsSignUp(false)}/>
            <Login isOpen={isLogin} setIsLogin={setIsLogin} setIsSignUp={setIsSignUp} setIsReset={setIsReset} onClose={() => setIsLogin(false)}/>
            <Header isAdmin={isAdmin} isUserLoggedIn={isUserLoggedIn} currentPage={"home"} setIsSignUp={setIsSignUp} setIsLogin={setIsLogin}/>
            { isError ? (
                <Error message={error} cancelMessage={setIsError}/>
            ) : (
                <></>
            )}
            { isLoaded ? (
                <>
                <div className="content">
                    <div className="section-1">
                        <div className="part">
                            <p className="title">
                                Welcome to The Bible!
                            </p>
                            <p className="plot">
                                &emsp;We are an independent group of passionate developers whose aim is to provide the world with a <u>new</u>, <u>free</u>, <u>high-quality</u> Bible mobile app.
                            </p>
                            <div className="download-links">
                                <Link to="#">
                                    <div>
                                        <svg id="googlePlay" viewBox="0 0 22 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M2.35587 0.0617284C2.01212 0.135062 1.53545 0.322978 1.53545 0.382561C1.54004 0.437561 12.1046 10.2046 12.1688 10.2092C12.1963 10.2138 13.0167 9.41171 13.9929 8.43546L15.7758 6.65255L10.1154 3.52672C6.99878 1.81256 4.32212 0.341311 4.15712 0.267978C3.60712 0.00672855 2.94253 -0.0666046 2.35587 0.0617284Z" fill="black"/>
                                            <path d="M0.256704 1.68885C-0.0091285 2.28468 3.81546e-05 1.77594 3.81546e-05 11.7538C3.81546e-05 20.6776 0.00462148 20.9342 0.0871213 21.2734C0.178788 21.6217 0.339204 21.993 0.403371 21.993C0.421704 21.993 2.84628 19.5822 5.78878 16.6397L11.1421 11.2863L5.79336 6.35009C2.85087 3.63677 0.426287 1.41385 0.412537 1.41385C0.394204 1.41385 0.325454 1.5376 0.256704 1.68885Z" fill="black"/>
                                            <path d="M15.1617 9.32921L13.255 11.245L14.9554 12.8125C15.895 13.6742 16.9538 14.6505 17.3113 14.9805L17.9667 15.5854L19.2363 14.8842C19.9375 14.4992 20.625 14.1096 20.7671 14.0134C21.5096 13.5138 22 12.6063 22 11.7263C22 10.8463 21.4913 9.91129 20.7488 9.42088C20.4463 9.2238 17.1738 7.41797 17.1142 7.41797C17.0913 7.41797 16.2113 8.27963 15.1617 9.32921Z" fill="black"/>
                                            <path d="M6.82919 17.6617C2.55295 21.9379 1.45753 23.0563 1.51253 23.0929C1.63628 23.1709 2.17253 23.3588 2.42003 23.4092C2.95628 23.5192 3.7217 23.4138 4.23045 23.1571C4.56961 22.9829 16.5138 16.3967 16.5596 16.3555C16.5917 16.328 14.85 14.6963 12.3292 12.3863L12.21 12.2809L6.82919 17.6617Z" fill="black"/>
                                        </svg>
                                        <p>Google Play</p>
                                    </div>
                                </Link>
                                <Link to="#">
                                    <div>
                                        <svg id="apple" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M18.2725 0.0790892C17.1756 0.316394 15.9469 0.986121 15.1928 1.75077C14.0432 2.92147 13.4473 4.32948 13.4473 5.8746V6.23846L14.0432 6.20682C15.1928 6.14354 15.9891 5.78495 16.8908 4.90956C18.2145 3.62811 18.8736 2.20956 18.8789 0.61698V-1.23172e-05L18.7365 0.00526112C18.6521 0.00526112 18.4465 0.0421752 18.2725 0.0790892Z" fill="black"/>
                                            <path d="M17.4287 6.61818C16.8381 6.72365 16.1789 6.92931 15.1031 7.34064C14.1381 7.70451 14.0906 7.72033 13.6318 7.72033C13.1941 7.72033 13.1098 7.70451 12.5771 7.49357C10.6945 6.75001 9.90879 6.56017 8.85938 6.60763C7.91543 6.64982 7.3248 6.81857 6.35977 7.31954C4.46133 8.29513 3.07969 10.3307 2.63145 12.7934C2.4627 13.711 2.4627 15.4248 2.63145 16.5059C3.11133 19.6172 4.20293 22.1801 6.075 24.6111C7.53574 26.5043 8.74863 27.2109 10.0828 26.942C10.4678 26.8682 10.7631 26.7733 11.6701 26.441C13.6529 25.7133 14.3701 25.7238 16.5217 26.5201C17.4182 26.8524 17.8453 26.9473 18.4676 26.9473C19.9125 26.9473 20.8564 26.2354 22.4279 23.9467C23.277 22.7074 23.9678 21.3996 24.358 20.2922L24.5162 19.8334L24.1629 19.6383C22.9131 18.9422 22.0904 18.1406 21.5525 17.0965C20.8828 15.7992 20.7088 14.1065 21.099 12.6299C21.2309 12.1184 21.4893 11.5541 21.8004 11.0848C22.1115 10.6154 22.8498 9.87716 23.3666 9.51329C23.7041 9.27599 23.7727 9.20216 23.7357 9.13361C23.5248 8.74865 22.8393 8.05255 22.333 7.69923C21.5789 7.18244 20.5875 6.7922 19.5961 6.61818C19.0371 6.52326 17.9455 6.52326 17.4287 6.61818Z" fill="black"/>
                                        </svg>

                                        <p>App Store</p>
                                    </div>
                                </Link>
                            </div>
                        </div>
                        <div className="part-img">
                            <img src={GenesisHome} alt="Bible Home Page" id="GenesisHome"/>
                        </div>
                    </div>
                    <div className="section-2">
                        <div className="part-img">
                            <img src={BibleInterface} alt="Bible Interface" id="BibleInterface" />
                        </div>
                        <div className="part">
                            <p className="title">
                                Tired of intrusive ads and clunky design? Try The Bible
                            </p>
                            <div id="features">
                                <div>
                                    <img src={Noads} alt="No ads"/>
                                    <p>No ads</p>
                                </div>
                                <div>
                                    <img src={Thunder} alt="Thunder"/>
                                    <p>Intuitive design</p>
                                </div>
                                <div>
                                    <img src={Audio} alt="Audio"/>
                                    <p>Audio<br/> Bible</p>
                                </div>
                                <div>
                                    <img src={Planet} alt="Planet"/>
                                    <p>35 languages</p>
                                </div>
                                <div>
                                    <img src={Free} alt="Free"/>
                                    <p>Free</p>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                    <div className="section-3">
                        <div className="part">
                            <p className="title">
                                Transform your Bible into Art Gallery
                            </p>
                            <p className="plot">
                                &emsp;     Experience the Bible through the eyes of history’s greatest artists. Featuring curated works from Raphael to Rembrandt, we invite you to explore the Word through a gallery of timeless art.
                            </p>
                        </div>
                        <div className="part-img">
                            <img src={ArtGallery} alt="Bible as Art Gallery" id="ArtGallery" />
                        </div>
                    </div>
                </div>
                <div className="section-4">
                    <div id="Request">
                        <div id="Text">
                            <p>
                                We are a small group of passionate developers doing our best to provide you with an excellent experience.
                            </p>
                            <p>
                                If you'd like to support our efforts, please consider subscribing to one of our premium plans. You can explore all premium features with a <u>7-day free trial</u>.
                            </p>
                        </div>
                        <div id="Freemium">
                            <HashLink to="/pricing#FreeTrial"><button >Start trial</button></HashLink>
                        </div>
                    </div>
                    <div id="Memo">
                        <p>Raphael – Marriage of the Virgin</p>
                    </div>
                </div>
                <div className="content">
                    <div className="section-5">
                        <div id="ContactUs">
                            <p>Do you have any <br/>questions?</p>
                            <Link  to="/contact"><button >Contact us</button></Link>
                        </div>
                        <div>
                            <img src={Logo} alt="Logo"/>
                        </div>
                    </div>
                </div>
                </>
            ) : (
                <Loader />
            )}
        </>
    )
}

export default App