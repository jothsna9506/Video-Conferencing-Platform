import React from 'react'
import "../styles/LandingPage.css"
import { Link, useNavigate } from 'react-router-dom'

export default function LandingPage() {
    const router = useNavigate();
    
  return (
    <div className='landingPageContainer'>
        <nav>
            <div className='navHeader'>
                <h2>Encuentro</h2>
            </div>
            <div className='navlist'>
                <p onClick={()=>{ router("/aljk23") }}>Join as Guest</p>
                <p>Register</p>
                <div onClick={()=>{ router("/auth") }} role='button'>
                    <p>Login</p>
                </div>
            </div>
        </nav>

        <div className="landingMainContainer">
            <div>
                <h1>
                  <span>Where Conversations</span> Come to Life
                </h1>

                <p>Meet. Chat. Collaborate through Encuentro</p>

                <div role='button'>
                    <Link to={"/auth"}>Get Started</Link>
                </div>
            </div>

            <div>
                <img src="/mobile.png" alt="Encuentro app preview"/>
            </div>
        </div>
    </div>
  )
}
