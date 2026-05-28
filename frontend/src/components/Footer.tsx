import Logo from "../assets/RentEase.svg";
import { navLinks, footerLinks, followUsLinks } from "@/data/Navlinks";
import { Link } from "react-router-dom";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="mt-28 bg-neutral-950 text-neutral-300 relative overflow-hidden">
      {/* cyan signature glow */}
      <div className="absolute -top-32 right-1/4 h-64 w-64 rounded-full bg-cyan-500/20 blur-[120px]" />
      <div className="absolute -bottom-32 left-1/4 h-64 w-64 rounded-full bg-cyan-400/10 blur-[120px]" />

      <div className="relative mx-auto max-w-[1440px] px-4 lg:px-8 py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <img src={Logo} alt="RentEase" className="h-10 mb-6 brightness-0 invert" />
            <p className="text-sm text-neutral-400 leading-relaxed max-w-md">
              RentEase is a sleek, verified real-estate platform that simplifies
              the way you search, list, and manage rooms, apartments, and
              commercial spaces.
            </p>

            <div className="mt-8 space-y-3 text-sm">
              <p className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-400/10 text-cyan-400"><FiPhone size={14} /></span>
                <span className="text-neutral-300">+977 9824155217</span>
              </p>
              <p className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-400/10 text-cyan-400"><FiMail size={14} /></span>
                <span className="text-neutral-300">hello@rentease.com</span>
              </p>
              <p className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-400/10 text-cyan-400"><FiMapPin size={14} /></span>
                <span className="text-neutral-300">Naxal, Kathmandu</span>
              </p>
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="eyebrow-light mb-5">Explore</h4>
            <ul className="space-y-3">
              {navLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link.path} className="text-sm text-neutral-400 hover:text-cyan-400 transition">
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="eyebrow-light mb-5">Rent</h4>
            <ul className="space-y-3">
              {footerLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    onClick={() => (window.location.href = `${link.path}`)}
                    to={link.path}
                    className="text-sm text-neutral-400 hover:text-cyan-400 transition">
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="eyebrow-light mb-5">Stay Connected</h4>
            <p className="text-sm text-neutral-400 mb-5">
              Follow us for new listings, market insights, and rental tips.
            </p>
            <div className="flex items-center gap-3">
              {followUsLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <a
                    key={index}
                    href={link.path || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid h-10 w-10 place-items-center rounded-xl border border-neutral-800 text-neutral-400 hover:border-cyan-400 hover:text-cyan-400 hover:bg-cyan-400/5 transition">
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <hr className="my-12 divider-cyan border-0" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-xs text-neutral-500">
            © 2026 RentEase. Crafted with precision.
          </p>
          <div className="flex items-center gap-6 text-xs text-neutral-500">
            <Link to="/terms-and-conditions" className="hover:text-cyan-400 transition">
              Terms & Conditions
            </Link>
            <Link to="/contact-us" className="hover:text-cyan-400 transition">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
