import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";

export const navLinks = [
    {
        text: "Home",
        path: "/",
    },

    {
        text: "Browse",
        path: "/browse-properties",
    },

    {
        text: "Contact Us",
        path: "/contact-us",
    },
];

export const footerLinks = [
    {
        text: "Room",
        path: "/browse-properties?category=Room",
    },

    {
        text: "Commercial Space",
        path: "/browse-properties?category=Commercial Space",
    },

    {
        text: "Appartment flat",
        path: "/browse-properties?category=Appartment",
    },
];

export const followUsLinks = [
    {
        icon: FaFacebook ,
        path: ""
    },
    {
        icon: FaInstagram,
        path: ""
    },
    {
        icon: FaLinkedin,
        path: ""
    },
]