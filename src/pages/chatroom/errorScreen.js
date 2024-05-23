import { Link } from "react-router-dom"

export const ErrorScreen = ()=>{

    return <div className='arial flexCenter flexColumn errorPageContainer'>
        <div className="flexCenter" >
            <h1 style={{marginBottom:"0"}}>🙃</h1>
            <h2 style={{marginBottom:"0"}}>Whoops</h2>
        </div>
        <h3>It looks like something's gone wrong…</h3>
        <h3>The person you were speaking to may have disconnected</h3>
        <Link to={"/chat"}>Take me home</Link>
    </div>
}