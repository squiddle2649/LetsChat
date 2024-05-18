import './contactPageStyling.css'
import { PhoneIcon,MailIcon } from './contactPageSVG'
import { Logo } from 'components/logo/logo'
import { Link } from 'react-router-dom'
    
const ContactPage = () =>{


    return <div>
        <Link to="/">
            <Logo></Logo>
        </Link>
        <div className="contactPageContainer flexStart">
            <div className="contactPage">
                <h1 className='arial-bold'>Contact me</h1>
                <ContactInfo
                    icon ={<MailIcon></MailIcon>}
                    text ="bruno.abj2017@gmail.com"
                ></ContactInfo>
                <ContactInfo
                    icon ={<PhoneIcon></PhoneIcon>}
                    text ="+49 15166521050"
                ></ContactInfo>
            </div>
        </div>
    </div>

}

const ContactInfo = (props)=>{
    return <div className='contactInfo flexAlignCenter'>
        <div>{props.icon}</div>
        <h3 style={{marginLeft:"10px"}}>{props.text}</h3>
    </div>  
}

export default ContactPage