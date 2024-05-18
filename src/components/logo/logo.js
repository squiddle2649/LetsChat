import { AppLogo,ImBoredText } from "./logoComponents"

export const Logo = ()=>{
    const styling = {
        // transform:"scale(0.3)",
    }
    return <div style={styling} className="flexCenter"> 
        <AppLogo></AppLogo>
        <ImBoredText></ImBoredText>
    </div>
}