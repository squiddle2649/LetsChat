import { AppLogo,ImBoredText } from "./logoComponents"

export const Logo = ()=>{
    const styling = {
        // transform:"scale(0.3)",
        display:'flex',
        alignItems:"center",

    }
    return <div style={styling}> 
        <AppLogo></AppLogo>
        <ImBoredText></ImBoredText>
    </div>
}