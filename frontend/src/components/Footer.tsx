import Logo from "../assets/RentEase.svg";
import { navLinks, footerLinks, followUsLinks } from "@/data/Navlinks";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="w-full bg-white py-0 flex items-center justify-center drop-shadow-sm bottom-0 z-50 mt-20">
      <div className="px-4 lg:px-6 w-full xl:px-8 2xl:px-10 flex flex-col items-center justify-between">
        <div className="w-full flex flex-col lg:flex-row items-start justify-between gap-0 lg:gap-26 xl:gap-36 2xl:gap-96">
          <div className="md:text-left">
            <img src={Logo} alt="Logo" className="w-56" />
            <p>
              RentEase is a smart rental platform designed to simplify the
              process of finding and listing apartments, rooms, and commercial
              spaces. Whether you're a tenant or a landlord, manage everything
              in one place with ease.
            </p>
          </div>
          <div className="flex flex-col md:flex-row w-full items-start gap-12 xl:gap-32 justify-between py-10">
            <ul>
              <li className="pb-6">
                <p className="font-semibold ">Links</p>
              </li>
              {navLinks.map((link, index) => (
                <li key={index} className="pb-2">
                  <Link to={link.path}>{link.text}</Link>
                </li>
              ))}{" "}
            </ul>

            <ul>
              <li className="pb-6">
                <p className="font-semibold">Rent</p>
              </li>
              {footerLinks.map((link, index) => (
                <li key={index} className="pb-2">
                  <Link onClick={() => window.location.href = `${link.path}`} to={link.path}>{link.text}</Link>
                </li>
              ))}
            </ul>

            <ul>
              <li className="pb-6">
                <p className="font-semibold">Contact Us</p>
              </li>
              <li className="pb-2">
                <p>+977 9824155217</p>
              </li>
              <li className="pb-2">
                <p>user@gmail.com</p>
              </li>
              <li className="pb-2">
                <p>Naxal, Kathmandu</p>
              </li>
            </ul>
          </div>
        </div>

        <hr className="w-full" />
        <div className="mt-5 mb-10 flex flex-col md:flex-row w-full gap-5 md:gap-0 md:items-center justify-between">
          <p>© 2026 Rent Ease . All Right Reserved</p>
          <div className="space-y-2">
            <p>Follow us on</p>
            <div className="w-full flex flex-row md:justify-between gap-8">
              {followUsLinks.map((link, index) => {
                const Icon = link.icon;

                return (
                  <a
                    key={index}
                    href={link.path}
                    target="_blank"
                    rel="noopener noreferrer">
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
