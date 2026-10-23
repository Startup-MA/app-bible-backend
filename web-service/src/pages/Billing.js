import { initializePaddle } from "@paddle/paddle-js"
import { useState, useEffect } from "react"
import { Link } from "react-router"

import Header from "../components/Header.js"
import Footer from "../components/Footer.js"
import Error from "../components/Error.js"
import Loader from "../components/Loader.js"
import NoProducts from "../components/NoProducts.js"
import PopUp from "../components/PopUp.js"
import SignUp from "../components/SignUp.js"
import Login from "../components/Login.js"
import Reset from "../components/Reset.js"
import PersonalInfo from "../components/PersonalInfo.js"

import Attention from "../assets/Attention.svg"
import Card from "../assets/Card.svg"
import Dots from "../assets/Dots.svg"
import Info from "../assets/Info.svg"

import axios from "axios"

import { datePrettify } from "../utils/datePrettify.js"
import { updater, paddle } from "../utils/initializePaddle.js"

import "../styles/Billing.css"

function Billing() {
    const [isAdmin, setIsAdmin] = useState(false)
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)
    const [subscriptionData, setSubscriptionData] = useState({})
    const [isNoSubscription, setIsNoSubscription] = useState(true)
    const [subscriptionStatus, setSubscriptionStatus] = useState("")
    const [isScheduledChange, setIsScheduledChange] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState({})
    const [isNoPaymentMethod, setIsNoPaymentMethod] = useState(true)
    const [transactionsList, setTransactionsList] = useState([])
    const [isNoTransactionsList, setIsNoTransactionsList] = useState(true)
    const [error, setError] = useState({})
    const [isError, setIsError] = useState(false)
    const [isPopUp, setIsPopUp] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const [isLogin, setIsLogin] = useState(false)
    const [isReset, setIsReset] = useState(false)
    const [isPersonalInfo, setIsPersonalInfo] = useState(false)

    const handleLogin = () => {
        setIsLogin(true)
    }

    const askPopUp = () => {
        setIsPopUp(true)
    }

    const handlePopUpAction = (event) => {
        if (event.target.innerText === "Cancel") {
            setIsPopUp(false)
        } else {
            setIsPopUp(false)
            cancelSubscription()
            window.scroll(0, 0)
        }
    }

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

    const cancelSubscription = async () => {
        setIsLoaded(false)
        
        axios(`${process.env.REACT_APP_BACKEND_URL}/api/customer/cancelSubscription`, {
            withCredentials: true,
            method: "POST"
        })
        .then(() => {
            setIsLoaded(true)
            updater.updateData()
        })
        .catch(error => {
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

    const cancelScheduledCancel = async () => {
        setIsLoaded(false)

        axios(`${process.env.REACT_APP_BACKEND_URL}/api/customer/cancelScheduledCancel`, {
                withCredentials: true,
                method: "POST"
            }
        ).then(() => {
            setIsLoaded(true)
            updater.updateData()
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

    const getSubscription = async (controller = {}) => {
        setIsLoaded(false)

        const res = axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/customer/getSubscription`, {
            withCredentials: true,
            signal: controller.signal
        }).then(data => {
            if (data.data.data) {
                setSubscriptionData(data.data.data.data)

                setSubscriptionStatus(data.data.data.data.status)

                setIsNoSubscription(false)
                
                if (data.data.data.data.scheduled_change) {
                    setIsScheduledChange(true)
                } else {
                    setIsScheduledChange(false)
                }
            }
            
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

        return res
    }

    const getPaymentMethod = async (controller = {}) => {
        setIsLoaded(false)

        const res = axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/customer/getCurrentPaymentMethod`, {
            withCredentials: true,
            signal: controller.signal
        }).then(data => {
            if (data.data.data) {
                setPaymentMethod(data.data.data)
                setIsNoPaymentMethod(false)
            }
            
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

        return res
    }

    const getTransactionsList = async (controller = {}) => {
        setIsLoaded(false)

        const res = axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/customer/getLastYearTransactions`, {
            withCredentials: true,
            signal: controller.signal
        }).then(data => {

            if (data.data.data) {
                setTransactionsList(data.data.data)
                setIsNoTransactionsList(false)
            }
            
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

        return res
    }

    const updatePaymentMethod = () => {
        setIsLoaded(false)

        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/customer/getUpdatePaymentMethodTransaction`,
            {
                withCredentials: true
            }
        ).then(data => {
            setIsLoaded(true)
            
            if (data.data.data) {

                paddle.Checkout.open({
                    transactionId: data.data.data.data.id,

                })
            }
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

    updater.updateData = (controller = {}) => {
        getSubscription(controller)
        getPaymentMethod(controller)
        getTransactionsList(controller)
        window.scrollTo(0, 0)
    }

    useEffect(() => {
        window.scrollTo(0, 0)
        const controller = new AbortController()
        
        authMe(controller)
        getProfile(controller)
        updater.updateData(controller)

        return () => controller.abort()
    }, [])

    return (
        <>    
            <PersonalInfo isOpen={isPersonalInfo} setIsLogin={setIsLogin} setIsUserLoggedIn={setIsUserLoggedIn} onClose={() => setIsPersonalInfo(false)} />
            <Reset isOpen={isReset} onClose={() => setIsReset(false)}/>
            <SignUp isOpen={isSignUp} setIsSignUp={setIsSignUp} setIsLogin={setIsLogin} onClose={() => setIsSignUp(false)}/>
            <Login isOpen={isLogin} setIsLogin={setIsLogin} setIsSignUp={setIsSignUp} setIsReset={setIsReset} onClose={() => setIsLogin(false)}/>
            <PopUp isOpen={isPopUp} onClose={() => setIsPopUp(false)} actionHandler={handlePopUpAction} title={"Cancellation"} content={"Your subscription will be scheduled to cancel at the end of the billing period. \n\n Are you sure you want to proceed?"}/>
            <Header isAdmin={isAdmin} isUserLoggedIn={isUserLoggedIn} hideElement={"signin"} setIsSignUp={setIsSignUp} setIsLogin={setIsLogin}/>
            {isError ? (
                <Error message={error} cancelMessage={setIsError}/>
            ) : (
                <></>
            )}
            {isLoaded ? (
                !isUserLoggedIn ? (
                    <div className="request-content">
                        <div className="request">
                            <h1>You are not signed in</h1>
                            <button onClick={handleLogin}>Sign In</button>
                        </div>
                    </div>
                ) : (
                        <div className="billing-content">
                            <div className="panel">
                                <div>
                                    <Link to="/dashboard/profile">Profile</Link>
                                </div>
                                <div>
                                    <Link to="/dashboard/billing" style={{color: "black"}}>Billing</Link>
                                </div>
                            </div>
                            {isNoSubscription ? (
                                <NoProducts />
                            ) : subscriptionData.billing_provider === "google" ? (
                                <div className="billing-section billing-plan">
                                    <div className="plan-info">
                                        <div>
                                            <h1>{subscriptionData.items[0].product.name}</h1>
                                            <div>
                                                <p>{subscriptionData.billing_cycle.interval === "year" ? "Yearly" : "Monthly"}</p>
                                                <p>Google Play</p>
                                            </div>
                                        </div>
                                        <div className="billing-warning">
                                            <p>This subscription is managed in Google Play. Change or cancel it in the Play Store.</p>
                                            <p><a href={subscriptionData.manage_url} target="_blank" rel="noopener noreferrer">Open Google Play subscriptions</a></p>
                                            {subscriptionData.next_billed_at ? (
                                                <p>Renews on <u>{datePrettify(subscriptionData.next_billed_at)}</u></p>
                                            ) : (
                                                <></>
                                            )}
                                            {subscriptionData.scheduled_change ? (
                                                <p>It is set to end on <u>{datePrettify(subscriptionData.scheduled_change.effective_at)}</u></p>
                                            ) : (
                                                <></>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {isScheduledChange ? (
                                    <>
                                        {subscriptionData.scheduled_change.action === "resume" ? (
                                            <div className="scheduled-change">
                                                <p>
                                                    This subscription was paused on <b>{datePrettify(subscriptionData.paused_at)}</b>. It will resume on <b>{datePrettify(subscriptionData.scheduled_change.effective_at)}</b>.
                                                </p>
                                            </div>

                                        ) : (
                                            subscriptionData.scheduled_change.resume_at ? (
                                                <div className="scheduled-change">
                                                    <p>
                                                    This subscription is scheduled to be paused on <b>{datePrettify(subscriptionData.scheduled_change.effective_at)}</b>. It will resume on <b>{datePrettify(subscriptionData.scheduled_change.resume_at)}</b>. 
                                                    </p>
                                                </div>
                                                
                                            ) : (
                                                <div className="scheduled-change">
                                                    <p>
                                                    This subscription is scheduled to be {subscriptionData.scheduled_change.action === "pause" ? "paused" : "canceled"} on <b>{datePrettify(subscriptionData.scheduled_change.effective_at)}</b>. {subscriptionData.scheduled_change.action === "cancel" ? (<a href="#" onClick={cancelScheduledCancel}>Don't cancel</a>) : (<></>)}
                                                    </p>
                                                </div>
                                                
                                            )
                                        )}
                                    </>
                                ) : (
                                    <></>
                                )}
                                <div className="billing-section billing-plan">
                                    <div className="plan-info">
                                        <div className="">
                                            <h1>{subscriptionData.items[0].product.name}</h1>
                                            <div>
                                                <p>{subscriptionData.billing_cycle.interval === "year" ? "Yearly" : "Monthly"}</p>
                                                <p>
                                                    {
                                                        subscriptionStatus === "past_due" ? 
                                                        subscriptionStatus[0].toUpperCase() + subscriptionStatus.split("_").join(" ").slice(1) : 
                                                        subscriptionStatus[0].toUpperCase() + subscriptionStatus.slice(1)
                                                    }
                                                </p>
                                                {subscriptionStatus === "active" || subscriptionStatus === "trialing" ? (
                                                    <svg width="11" height="11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <circle cx="5.5" cy="5.5" r="4" fill="#32E600"/>
                                                    </svg>
                                                ) : (<></>)}
                                                {subscriptionStatus === "canceled" ? (
                                                    <svg width="11" height="11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <circle cx="5.5" cy="5.5" r="4" fill="#FF3C3C"/>
                                                    </svg>
                                                ) : (<></>)}
                                                {subscriptionStatus === "paused" || subscriptionStatus === "past_due" ? (
                                                    <svg width="11" height="11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <circle cx="5.5" cy="5.5" r="4" fill="#E6B100"/>
                                                    </svg>
                                                ) : (<></>)}

                                            </div>
                                        </div>
                                        <div className="billing-warning">
                                            {subscriptionData.next_billed_at ? (
                                                <p>Your subscription will auto renew on <u>{datePrettify(subscriptionData.next_billed_at)}</u></p>
                                            ) : (
                                                <></>
                                            )}
                                            {subscriptionStatus === "past_due" ? (
                                                <p>
                                                There was an issue processing your payment. Please update your payment method to keep your subscription active and avoid <b>cancellation</b>.
                                                </p>
                                            ) : (
                                                <></>
                                            )}
                                        </div>
                                        
                                    </div>
                                    <div className="control-button">
                                        <Link style={subscriptionStatus === "paused" || subscriptionStatus === "past_due" || isScheduledChange ? {visibility: "hidden"} : {}} to="/pricing"><button >Adjust Plan</button></Link>
                                    </div>
                                </div>
                                <div className="billing-section payment">
                                    <div>
                                        <h1>Payment</h1>
                                        {isNoPaymentMethod ? (
                                            <div className="no-data">
                                                <img src={Attention} alt="Attention"/>
                                                <h3>Could not load the data.</h3>
                                            </div>
                                        ) : (
                                            <div>
                                                {paymentMethod.type === "card" || paymentMethod.type === "south_korea_local_card" ? (
                                                    <div className="card">
                                                        <img id="Card" src={Card} alt="Card"/>
                                                        <p>{paymentMethod.type === "south_korea_local_card" ? paymentMethod.south_korea_local_card.type.split("_").join(" ").toUpperCase() : paymentMethod.card.type.split("_").join(" ").toUpperCase()}</p>
                                                        <img id="Dots" src={Dots}/>
                                                        <p>{paymentMethod.type === "south_korea_local_card" ? paymentMethod.south_korea_local_card.last4 : paymentMethod.card.last4}</p>
                                                    </div>                                            
                                                ) : (
                                                    <p id="Other-method">{paymentMethod.type.split("_").join(" ").toUpperCase()}</p>
                                                )}
                                            </div>
                                        )} 
                                    </div>
                                    <div className="control-button">
                                        <button style={subscriptionStatus === "canceled" || subscriptionStatus === "paused" ? {visibility: "hidden"} : {}} onClick={updatePaymentMethod}>Update</button>
                                    </div>
                                </div>
                                <div className="billing-section transactions">
                                    <div>
                                        <h1>Transactions</h1>
                                        {isNoTransactionsList ? (
                                            <div className="no-data">
                                                <img src={Attention} alt="Attention"/>
                                                <h3>Could not load the data.</h3>
                                            </div>
                                        ) : (
                                            <div className="transactions-list">
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th>Date</th>
                                                            <th>Total ({transactionsList[0].details.totals.currency_code})</th>
                                                            <th>Status</th>
                                                            <th>Origin</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {transactionsList.map((transaction, index) => 
                                                            <tr key={index}>
                                                                <td>{datePrettify(transaction.updated_at)}</td>
                                                                <td className="totals">
                                                                    <div className="totals-container">
                                                                        {(transaction.details.totals.total/100).toFixed(2)}
                                                                        <img src={Info} id="Info"/>
                                                                        <div className="totals-memo" i={index}>
                                                                            {+transaction.details.totals.credit ? (<p>Credit: {(transaction.details.totals.credit/100).toFixed(2)} {transaction.details.totals.currency_code}</p>) : (<></>)}
                                                                            {+transaction.details.totals.credit_to_balance ? (<p>Credit to balance: {(transaction.details.totals.credit_to_balance/100).toFixed(2)} {transaction.details.totals.currency_code}</p>) : (<></>)}
                                                                            <p>Price: {(transaction.details.totals.subtotal/100).toFixed(2)} {transaction.details.totals.currency_code}</p>
                                                                            <p>Tax: {(transaction.details.totals.tax/100).toFixed(2)} {transaction.details.totals.currency_code}</p>
                                                                            <p>Total: {(transaction.details.totals.total/100).toFixed(2)} {transaction.details.totals.currency_code}</p>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td>{transaction.status.split("_").join(" ")}</td>
                                                                <td>{transaction.origin === "web" ? "Start" : (transaction.origin === "subscription_recurring" ? "Renew" : "Update")}</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="billing-section cancellation">
                                    <div>
                                        <h1>Cancellation</h1>
                                        <p>Cancel subscription at the end of the period</p>
                                    </div>
                                    <div className="control-button">
                                        <button style={subscriptionStatus === "canceled" || subscriptionStatus === "past_due" || isScheduledChange ? {visibility: "hidden"} : {}} onClick={askPopUp}>Cancel</button>
                                    </div>
                                </div>
                                </>
                            )}
                        </div>
                )) : (
                <Loader />
            )}
            <Footer />
        </>
    )
}

export default Billing