import { initializePaddle } from "@paddle/paddle-js"
import { useState, useEffect } from "react"
import { Link  } from "react-router"
import { useNavigate, useLocation } from "react-router-dom"

import Header from "../components/Header.js"
import Footer from "../components/Footer.js"
import Error from "../components/Error.js"
import Loader from "../components/Loader.js"
import PopUp from "../components/PopUp.js"
import SignUp from "../components/SignUp.js"
import Login from "../components/Login.js"
import Reset from "../components/Reset.js"
import PersonalInfo from "../components/PersonalInfo.js"

import FreeColors from "../assets/FreeColors.svg"
import Audio from "../assets/Audio.svg"
import Planet from "../assets/Planet.svg"
import Free from "../assets/Free.svg"
import Noads from "../assets/No ads.svg"
import PaidColors from "../assets/PaidColors.svg"
import CustomContent from "../assets/CustomContent.svg"
import SectionArrow from "../assets/SectionArrow.svg"

import "../styles/Pricing.css"

import axios from "axios"

import { updater, paddle } from "../utils/initializePaddle.js"

function Pricing() {
    const locationHash = useLocation().hash
    const [isAdmin, setIsAdmin] = useState(false)
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)
    const [userData, setUserData] = useState({})
    const [subscriptionData, setSubscriptionData] = useState({})
    const [isNoSubscription, setIsNoSubscription] = useState(true)
    const [isScheduledChange, setIsScheduledChange] = useState(false)
    const [subscriptionStatus, setSubscriptionStatus] = useState("")
    const [isSubscriptionLoadingError, setIsSubscriptionLoadingError] = useState(false)
    const [error, setError] = useState({})
    const [isError, setIsError] = useState(false)
    const [monthlyChecked, setMonthlyChecked] = useState(true)
    const [billingCycle, setBillingCycle] = useState("month")
    const [thematicalPriceLabel, setThematicalPriceLabel] = useState("")
    const [advancedPriceLabel, setAdvancedPriceLabel] = useState("")
    const [premiumPriceLabel, setPremiumPriceLabel] = useState("")
    const [isPopUp, setIsPopUp] = useState(false)
    const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState("")

    const [cachedMonthly, setCachedMonthly] = useState()
    const [cachedYearly, setCachedYearly] = useState()
    const [isSignUp, setIsSignUp] = useState(false)
    const [isLogin, setIsLogin] = useState(false)
    const [isReset, setIsReset] = useState(false)
    const [isPersonalInfo, setIsPersonalInfo] = useState(false)

    const navigate = useNavigate()

    const handleSignUp = () => {
        setIsSignUp(true)
    }

    let customerInfo = {
        email: userData.email
    }

    let thematical = "pro_01kkyrw1pbs6hqkasknt9p91tf"
    let advanced = "pro_01kkyrwmqtykq8anvwvjj5czmk"
    let premium = "pro_01kkyrx63shwv0wc514bm8g5w2"

    let monthItems = [
        {
            quantity: 1,
            priceId: "pri_01kkyrzk5rddjgp6hzzq644cbe"
        },
        {
            quantity: 1,
            priceId: "pri_01kkys314de4bmqgkry01740nq"
        },
        userData.is_free_trial_used ? {
            quantity: 1,
            priceId: "pri_01kr3vqqdn977tt215q90nebjg"
        } : {
            quantity: 1,
            priceId: "pri_01kkys5430kkr8cxv02pmrak44",
        }
    ]

    let yearItems = [
        {
            quantity: 1,
            priceId: "pri_01kkys1sdd64pt19r083a4y796"
        },
        {
            quantity: 1,
            priceId: "pri_01kkys462vap4x56ne0q8hg4mv"
        },
        {
            quantity: 1,
            priceId: "pri_01kkys6e2jw7j7brjka23jg9ms"
        }
    ]

    const askPopUp = (event) => {
        setSelectedPlanForUpgrade(+event.target.value)
        setIsPopUp(true)
    }

    const handlePopUpAction = (event) => {
        if (event.target.innerText === "Cancel") {
            setIsPopUp(false)
        } else {
            setIsPopUp(false)
            upgradePlan()
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
        setIsLoaded(false)

        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/authMe`, {
                signal: controller.signal,
                withCredentials: true
            }
        ).then(data => {
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

    const getSubscription = async (controller = {}) => {
        setIsLoaded(false)

        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/customer/getSubscription`, {
                withCredentials: true,
                signal: controller.signal
            }
        ).then(data => {
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

            setIsSubscriptionLoadingError(true)
        })
    }

    const upgradePlan = async (event = "") => {
        window.scroll(0, 0)
        setIsLoaded(false)
        const index = event ? +event.target.value : selectedPlanForUpgrade

        axios.patch(`${process.env.REACT_APP_BACKEND_URL}/api/customer/upgradePlan`, 
            {
                proration_billing_mode: "prorated_immediately",
                items: [monthlyChecked ? {
                    quantity: 1,
                    price_id: monthItems[index].priceId
                } : {
                    quantity: 1,
                    price_id: yearItems[index].priceId
                }],
                on_payment_failure: "prevent_change"
            },
            {
                withCredentials: true
            },
        ).then(data => {
            setTimeout(() => {
                updater.updateData()
                setIsLoaded(true)
            }, 5000)
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

    updater.updateData = (controller = {}) => {
        authMe(controller)
        getProfile(controller)
        getSubscription(controller)
        getPrices()
    }

    useEffect(() => {
        if (!(locationHash === "#FAQs" || locationHash === "#FreeTrial")) window.scroll(0, 0)

        const controller = new AbortController()
        
        updater.updateData(controller)

        return () => controller.abort()
    }, [])

    const changeBillingCycle = (event) => {
        const cycle = event.target.value.split("-").at(-1)
        if (cycle === "month") {
            setMonthlyChecked(true)
            setBillingCycle("month")
        } else {
            setMonthlyChecked(false)
            setBillingCycle("year")
        }
        
        getPrices(cycle)
    }

    const setPrices = (items) => items.forEach(item => {
        if (item.product.id === thematical) {
            setThematicalPriceLabel(item.formattedTotals.subtotal)
        } else if (item.product.id === advanced) {
            setAdvancedPriceLabel(item.formattedTotals.subtotal)
        } else if (item.product.id === premium) {
            setPremiumPriceLabel(item.formattedTotals.subtotal)
        }
    })

    const getPrices = async (billingCycle) => {
        const cycle = billingCycle ? billingCycle : (monthlyChecked ? "month" : "year")
        if (cycle === "month" && cachedMonthly) {
            setPrices(cachedMonthly)
            return
        } else if (cycle === "year" && cachedYearly) {
            setPrices(cachedYearly)
            return
        }
        const itemsList = cycle === "month" ? monthItems : yearItems
        
        const request = {
            items: itemsList,
        }

        paddle
        .PricePreview(request)
        .then(result => {
            let items = result.data.details.lineItems

            setPrices(items)
            cycle === "month" ? setCachedMonthly(items) : setCachedYearly(items)
        })
        .catch(error => {
            console.error(error)
        })
    }

    const openCheckout = (event) => {
        const index = +event.target.value
        
        if (monthlyChecked) {
            paddle.Checkout.open({
                settings: {
                    allowLogout: false
                },
                items: [monthItems[index]],
                customer: customerInfo,
                customData: {email: customerInfo.email}
            })

        } else if (!monthlyChecked) {
            paddle.Checkout.open({
                settings: {
                    allowLogout: false
                },
                items: [yearItems[index]],
                customer: customerInfo,
                customData: {email: customerInfo.email}
            })

        }

    }

    return (
        <>
            <PersonalInfo isOpen={isPersonalInfo} onClose={() => setIsPersonalInfo(false)} />
            <Reset isOpen={isReset} onClose={() => setIsReset(false)}/>
            <SignUp isOpen={isSignUp} setIsSignUp={setIsSignUp} setIsLogin={setIsLogin} onClose={() => setIsSignUp(false)}/>
            <Login isOpen={isLogin} setIsLogin={setIsLogin} setIsSignUp={setIsSignUp} setIsReset={setIsReset} onClose={() => setIsLogin(false)}/>
            <PopUp isOpen={isPopUp} onClose={() => setIsPopUp(false)} actionHandler={handlePopUpAction} title={"Update"} content={"Your subscription will be updated and your account will be charged/credited immediately. These changes are irreversible. Are you sure?"}/>
            <Header isAdmin={isAdmin} isUserLoggedIn={isUserLoggedIn} currentPage={"pricing"} hideElement={"signup"} setIsSignUp={setIsSignUp} setIsLogin={setIsLogin}/>
            {isError ? (
                <Error message={error} cancelMessage={setIsError}/>
            ) : (
                <></>
            )}
            <div className="pricing-content">
                <div className="title">
                    <p>Choose your plan</p>
                </div>
                <div className="pricing-toggle">
                    <input type="radio" name="plan" value="month" onChange={changeBillingCycle} checked={monthlyChecked} id="Monthly"/><label htmlFor="Monthly">Monthly</label>
                    <input type="radio" name="plan" value="year" onChange={changeBillingCycle} checked={!monthlyChecked} id="Yearly"/><label htmlFor="Yearly">Yearly</label>
                </div>
                {isLoaded ? (
                    <div className="pricing-grid">
                        <div className="plan free">
                            <div className="plan-name">
                                <h3>Basic</h3>
                            </div>
                            <div className="plan-price">
                                <h1 id="basic-price">Free</h1>
                            </div>
                            {isUserLoggedIn ? (
                                <button  className="plan-buy" style={(!isNoSubscription && subscriptionStatus !== "canceled") || isSubscriptionLoadingError ? {visibility: "hidden"} : {}}>
                                    Current
                                </button>
                            ) : (
                                <button onClick={handleSignUp} className="plan-buy">
                                    Sign up
                                </button>
                            )}

                            <div className="features">
                                <div>
                                    <img src={Noads} alt="No ads"/>
                                    <p>No ads</p>
                                </div>
                                <div>
                                    <img src={Free} alt="Free"/>
                                    <p>Free</p>
                                </div>
                                <div>
                                    <img src={Audio} alt="Audio"/>
                                    <p>Audio<br/>Bible</p>
                                </div>
                                <div>
                                    <img src={FreeColors} alt="Colors"/>
                                    <p>2 Themes</p>
                                </div>
                                <div>
                                    <img src={Planet} alt="Planet"/>
                                    <p>35 languages</p>
                                </div>
                            </div>
                        </div>
                        <div className="plan thematical">
                            <div className="plan-name">
                                <h3>Thematical</h3>
                            </div>
                            <div className="pricing-toggle">
                                <input type="radio" name="thematical-plan" value="thematical-month" onChange={changeBillingCycle} checked={monthlyChecked} id="ThematicalMonthly"/><label htmlFor="ThematicalMonthly">Monthly</label>
                                <input type="radio" name="thematical-plan" value="thematical-year" onChange={changeBillingCycle} checked={!monthlyChecked} id="ThematicalYearly"/><label htmlFor="ThematicalYearly">Yearly</label>
                            </div>
                            <div className="plan-price">
                                <h1 id="thematical-price">{thematicalPriceLabel || "Unavailable"}</h1>
                            </div>
                            {isUserLoggedIn ? (
                                isNoSubscription || subscriptionStatus === "canceled" ? (
                                    <button  className="plan-buy" style={isSubscriptionLoadingError ? {visibility: "hidden"} : {}}  onClick={openCheckout} value="0">
                                        Buy now
                                    </button>
                                ) : (
                                    subscriptionData.items[0].product.name === "Thematical" ? (
                                        subscriptionData.billing_cycle.interval === "month" ? (
                                            monthlyChecked ? (
                                                <button  className="plan-buy">
                                                    Current
                                                </button>
                                            ) : (
                                                <button  className="plan-buy" onClick={askPopUp} value="0" style={isScheduledChange || subscriptionStatus === "paused" || subscriptionStatus === "past_due" || subscriptionStatus === "trialing" ? {visibility: "hidden"} : {}}>
                                                    Upgrade
                                                </button>
                                            )

                                        ) : (
                                            monthlyChecked ? (
                                                <button  className="plan-buy" onClick={askPopUp} value="0" style={isScheduledChange || subscriptionStatus === "paused" || subscriptionStatus === "past_due" || subscriptionStatus === "trialing" ? {visibility: "hidden"} : {}}>
                                                    Downgrade
                                                </button>
                                            ) : (
                                                <button  className="plan-buy">
                                                    Current
                                                </button>
                                            )

                                        )
                                    ) : (
                                        <button  className="plan-buy" style={{visibility: "hidden"}}>
                                            --
                                        </button>                           
                                    )
                                )
                            ) : (
                                <button onClick={handleSignUp} className="plan-buy">
                                    Sign up
                                </button>
                            )}
                            <div className="features">
                                <div>
                                    <h3>Basic</h3>
                                </div>
                                <div>
                                    <h1>+</h1>
                                </div>
                                <div>
                                    <img src={PaidColors} alt="Colors"/>
                                    <h3>7 Themes</h3>
                                </div>
                            </div>
                        </div>
                        <div className="plan advanced">
                            <div className="plan-name">
                                <h3>Advanced</h3>
                            </div>
                            <div className="pricing-toggle">
                                <input type="radio" name="advanced-plan" value="advanced-month" onChange={changeBillingCycle} checked={monthlyChecked} id="AdvancedMonthly"/><label htmlFor="AdvancedMonthly">Monthly</label>
                                <input type="radio" name="advanced-plan" value="advanced-year" onChange={changeBillingCycle} checked={!monthlyChecked} id="AdvancedYearly"/><label htmlFor="AdvancedYearly">Yearly</label>
                            </div>
                            <div className="plan-price">
                                <h1 id="advanced-price">{advancedPriceLabel || "Unavailable"}</h1>
                            </div>
                            {isUserLoggedIn ? (
                                isNoSubscription || subscriptionStatus === "canceled" ? (
                                    <button  className="plan-buy" style={isSubscriptionLoadingError ? {visibility: "hidden"} : {}}  onClick={openCheckout} value="1">
                                        Buy now
                                    </button>
                                ) : (
                                    subscriptionData.items[0].product.name === "Advanced" ? (
                                        subscriptionData.billing_cycle.interval === "month" ? (
                                            monthlyChecked ? (
                                                <button  className="plan-buy">
                                                    Current
                                                </button>
                                            ) : (
                                                <button  className="plan-buy" onClick={askPopUp} value="1" style={isScheduledChange || subscriptionStatus === "paused" || subscriptionStatus === "past_due" || subscriptionStatus === "trialing" ? {visibility: "hidden"} : {}}>
                                                    Upgrade
                                                </button>
                                            )

                                        ) : (
                                            monthlyChecked ? (
                                                <button  className="plan-buy" onClick={askPopUp} value="1" style={isScheduledChange || subscriptionStatus === "paused" || subscriptionStatus === "past_due" || subscriptionStatus === "trialing" ? {visibility: "hidden"} : {}}>
                                                    Downgrade
                                                </button>
                                            ) : (
                                                <button  className="plan-buy">
                                                    Current
                                                </button>
                                            )

                                        )
                                    ) : (
                                        subscriptionData.items[0].product.name === "Thematical" ? (
                                            subscriptionData.billing_cycle.interval === "month" ? (
                                                <button  className="plan-buy" onClick={askPopUp} value="1" style={isScheduledChange || subscriptionStatus === "paused" || subscriptionStatus === "past_due" || subscriptionStatus === "trialing" ? {visibility: "hidden"} : {}}>
                                                    Upgrade
                                                </button>
                                            ) : (
                                                monthlyChecked ? (
                                                    <button  className="plan-buy" onClick={askPopUp} value="1" style={isScheduledChange || subscriptionStatus === "paused" || subscriptionStatus === "past_due" || subscriptionStatus === "trialing" ? {visibility: "hidden"} : {}}>
                                                        Downgrade
                                                    </button>
                                                ) : (
                                                    <button  className="plan-buy" onClick={askPopUp} value="1" style={isScheduledChange || subscriptionStatus === "paused" || subscriptionStatus === "past_due" || subscriptionStatus === "trialing" ? {visibility: "hidden"} : {}}>
                                                        Upgrade
                                                    </button>
                                                )

                                            )
                                        ) : (
                                            <button  className="plan-buy" style={{visibility: "hidden"}}>
                                                --
                                            </button>
                                        )
                                    )
                                )
                            ) : (
                                <button onClick={handleSignUp} className="plan-buy">
                                    Sign up
                                </button>
                            )}
                            <div className="features">
                                <div>
                                    <h3>Thematical</h3>
                                </div>
                                <div>
                                    <h1>+</h1>
                                </div>
                                <div>
                                    <img src={CustomContent} alt="Custom"/>
                                </div>   
                            </div>
                        </div>
                        <div className="plan premium" id="FreeTrial">
                            <div className="plan-name">
                                <h3>Premium</h3>
                            </div>
                            <div className="pricing-toggle">
                                <input type="radio" name="premium-plan" value="premium-month" onChange={changeBillingCycle} checked={monthlyChecked} id="PremiumMonthly"/><label htmlFor="PremiumMonthly">Monthly</label>
                                <input type="radio" name="premium-plan" value="premium-year" onChange={changeBillingCycle} checked={!monthlyChecked} id="PremiumYearly"/><label htmlFor="PremiumYearly">Yearly</label>
                            </div>
                            <div className="plan-price">
                                <h1 id="premium-price">{premiumPriceLabel || "Unavailable"}</h1>
                            </div>
                            {isUserLoggedIn ? (
                                isNoSubscription || subscriptionStatus === "canceled"  ? (
                                    <button  className="plan-buy" style={isSubscriptionLoadingError ? {visibility: "hidden"} : {}}  onClick={openCheckout} value="2">
                                        {!userData.is_free_trial_used && monthlyChecked ? "Free trial" : "Buy now"}
                                    </button>
                                ) : (
                                    subscriptionData.items[0].product.name === "Premium" ? (
                                        subscriptionData.billing_cycle.interval === "month" ? (
                                            monthlyChecked ? (
                                                <button  className="plan-buy">
                                                    Current
                                                </button>
                                            ) : (
                                                <button  className="plan-buy" onClick={askPopUp} value="2" style={isScheduledChange || subscriptionStatus === "paused" || subscriptionStatus === "past_due" || subscriptionStatus === "trialing" ? {visibility: "hidden"} : {}}>
                                                    Upgrade
                                                </button>
                                            )
                                        ) : (
                                            monthlyChecked ? (
                                                <button  className="plan-buy" onClick={askPopUp} value="2" style={isScheduledChange || subscriptionStatus === "paused" || subscriptionStatus === "past_due" || subscriptionStatus === "trialing" ? {visibility: "hidden"} : {}}>
                                                    Downgrade
                                                </button>
                                            ) : (
                                                <button  className="plan-buy">
                                                    Current
                                                </button>
                                            )

                                        )
                                    ) : (
                                        subscriptionData.billing_cycle.interval === "month" ? (
                                            <button  className="plan-buy" onClick={askPopUp} value="2" style={subscriptionStatus === "paused" || subscriptionStatus === "past_due" || subscriptionStatus === "trialing" || isScheduledChange ? {visibility: "hidden"} : {}}>
                                                Upgrade
                                            </button>
                                        ) : (
                                            monthlyChecked ? (
                                                <button  className="plan-buy" onClick={askPopUp} value="2" style={subscriptionStatus === "paused" || subscriptionStatus === "past_due" || subscriptionStatus === "trialing" || isScheduledChange ? {visibility: "hidden"} : {}}>
                                                    Downgrade
                                                </button>
                                            ) : (
                                                <button  className="plan-buy" onClick={askPopUp} value="2" style={subscriptionStatus === "paused" || subscriptionStatus === "past_due" || subscriptionStatus === "trialing" || isScheduledChange ? {visibility: "hidden"} : {}}>
                                                    Upgrade
                                                </button>
                                            )
                                        )
                                    )
                                )
                            ) : (
                                <button onClick={handleSignUp} className="plan-buy">
                                    Sign up
                                </button>
                            )}
                            <div className="features">
                                <div>
                                    <h3>Advanced</h3>
                                </div>
                                <div>
                                    <h1>+</h1>
                                </div>
                                <div>
                                    <h1>Frescoes</h1>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <Loader />
                )}
                <div className="FAQ-section" id="FAQs">
                    <div className="title">
                        <h4>FAQs</h4>
                    </div>
                    <div className="questions">
                        <div className="section">
                            <input type="checkbox" id="arrow-1"/>
                            <div className="question">
                                <label htmlFor="arrow-1">
                                    <p>How do I change my subscription plan?</p>
                                    <img src={SectionArrow} alt="Arrow"/>
                                </label>
                            </div>
                            <div className="answer">
                                <p>
                                    The Bible paid plans are available in the form of annual and monthly subscriptions. You can change your subscription plan at any time by downgrading/upgrading your plan at our pricing page, and your account will be charged or credited based on the percentage of the billing cycle left at the time the plan has been changed. You can still use the service for the remainder of your subscription period even after the cancellation. However, the already subscribed plan is not refundable.
                                </p>
                            </div>
                        </div>
                        <div className="section">
                            <input type="checkbox" id="arrow-2"/>
                            <div className="question">
                                <label htmlFor="arrow-2">
                                    <p>Do you have a free trial?</p>
                                    <img src={SectionArrow} alt="Arrow"/>
                                </label>
                            </div>
                            <div className="answer">
                                <p>We offer all new subscribers a 1-week trial period to experience The Bible services.</p>
                            </div>
                        </div>
                        <div className="section">
                            <input type="checkbox" id="arrow-3"/>
                            <div className="question">
                                <label htmlFor="arrow-3">
                                    <p>How do I cancel my subscription?</p>
                                    <img src={SectionArrow} alt="Arrow"/>
                                </label>
                            </div>
                            <div className="answer">
                                <p>You can always cancel your paid plan at any time by clicking Cancel button on the billing page. You’ll be able to keep your paid plan for the remaining period until the next billing date</p>
                            </div>
                        </div>
                        <div className="section">
                            <input type="checkbox" id="arrow-4"/>
                            <div className="question">
                                <label htmlFor="arrow-4">
                                    <p>How do I get a refund?</p>
                                    <img src={SectionArrow} alt="Arrow"/>
                                </label>
                            </div>
                            <div className="answer">
                                <p>By wisdom</p>
                            </div>
                        </div>
                        <div className="section">
                            <input type="checkbox" id="arrow-5"/>
                            <div className="question">
                                <label htmlFor="arrow-5">
                                    <p>Can’t find your question?</p>
                                    <img src={SectionArrow} alt="Arrow"/>
                                </label>
                            </div>
                            <div className="answer">
                                <Link to="/contact">Contact us</Link>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </> 
    )
}

export default Pricing

