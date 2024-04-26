import "./messageStyling.css"
import { Options } from "../chatroomSVG"


const OptionsMenu = ()=>{
    return <div className="redBG optionsMenu"></div>
}

export const Message = (props)=>{
    const usernameStyle= {
        color: props.me?"#277ab9":"#cd4e67",
        margin:"0",
    }   
    const activateOptions = ()=>{
        console.log('?')
    }

    return <div className="arial flexRow" style={{marginTop:"8px",marginBottom:"15px"}}>
        <div className="messageOptions" onClick={activateOptions}>
            <Options></Options>
            <OptionsMenu></OptionsMenu>
        </div>
        <div class="flexColumn">
            <p className=" arial-bold" style={usernameStyle}>
                {props.username}
            </p>
            <h3 className="messageText blackText" style={{marginTop:"0"}}>{props.content}</h3>
        </div>
</div>
}