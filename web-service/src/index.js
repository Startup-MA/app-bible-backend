import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route  } from "react-router"

import ResetPage from "./pages/ResetPage.js"
import Pricing from "./pages/Pricing.js"
import Contact from "./pages/Contact.js"
import Profile from "./pages/Profile.js"
import Billing from "./pages/Billing.js"
import Tickets from "./pages/Tickets.js"
import NotFound from "./pages/NotFound.js"

import App from "./App"

import "./styles/General.css"

const rootElement = document.getElementById("root")
const root = createRoot(rootElement)

root.render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="*" element={<NotFound />} />
                <Route path="/" element={<App />}/>
                <Route path="/tickets" element={<Tickets />}/>
                <Route path="/dashboard/profile" element={<Profile />}/>
                <Route path="/dashboard/billing" element={<Billing />}/>
                <Route path="/pricing" element={<Pricing/>}/>
                <Route path="/contact" element={<Contact/>}/>
                <Route path="/reset/:uuid" element={<ResetPage/>}/>
            </Routes>                
        </BrowserRouter>
    </StrictMode>
)