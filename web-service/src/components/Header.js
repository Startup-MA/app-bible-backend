import {useState, useEffect } from "react"
import { Link } from "react-router"

import Logo from "../assets/Logo.svg"
import Hamburger from "../assets/Hamburger.svg"
import Close from "../assets/Close.svg"

import "../styles/Header.css"

function Header({isAdmin, isUserLoggedIn, currentPage, hideElement, setIsSignUp, setIsLogin}) {
    const [isVisible, setIsVisible] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)

    const handleForm = (event) => {
        if (event.target.innerText === "Sign Up") {
            setIsSignUp(true)
        } else {
            setIsLogin(true)
        }
    }

    const controlHeader = () => {
        if (typeof window !== 'undefined') {
            if (window.scrollY > lastScrollY && window.scrollY > 100) {
                setIsVisible(false)
            } else {
                setIsVisible(true)
            }

            setLastScrollY(window.scrollY)
        }
    }

    useEffect(() => {
        window.addEventListener('scroll', controlHeader)

        return () => {
            window.removeEventListener('scroll', controlHeader)
        }
    }, [lastScrollY])

    return (
        <div className={`Header ${isVisible ? "show" : "hide"}`}>
            <input type="checkbox" id="Hamburger" className="Hamburger"/>
            <label htmlFor="Hamburger">
                <img src={Hamburger} alt="Hamburger" id="Hamburger"/>
                <img src={Close} alt="Close" id="Close"/>
            </label>
            <div>
                <Link to="/" >
                    <img src={Logo} alt="Logo" className="Logo"/>
                </Link>
            </div>
            <nav className="menu" >
                <ul>
                    { isAdmin ? (
                        <li>
                            <Link  to={{pathname: "/tickets", search: "?page=1"}} currentpage={currentPage === "tickets" ? "true" : "false"}>Tickets</Link>
                        </li >
                    ) : (
                        <></>
                    )}
                    <li >
                        <Link  to="/pricing" currentpage={currentPage === "pricing" ? "true" : "false"}>Pricing</Link>
                    </li >
                    <li >
                        <Link  to="/contact" currentpage={currentPage === "contact" ? "true" : "false"}>Contact</Link>
                    </li>
                    {!isUserLoggedIn ? (
                        <>
                            <li  style={hideElement === "signup" ? {display: "none"} : {}} onClick={handleForm}>
                                <Link  to="#" >Sign Up</Link>
                            </li>
                            <li  style={hideElement === "signin" ? {display: "none"} : {}} onClick={handleForm}>
                                <Link  to="#">Sign In</Link>
                            </li>
                        </>
                    ) : (
                        <>
                            <li >
                                <Link  to="/dashboard/profile" id="Dashboard">Dashboard</Link>
                            </li>
                        </>
                    )}
                </ul>
            </nav>
        </div>
    )
}

export default Header