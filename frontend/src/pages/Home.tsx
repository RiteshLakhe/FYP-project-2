import { useEffect, useState } from "react";
import PropertyCard from "@/components/PropertyCard";
import Searchbar from "../components/Searchbar";
import { Axios } from "@/services/AxiosInstance";
import { API_ENDPOINTS } from "@/services/Endpoints";
import { Link } from "react-router";
import { IoIosArrowForward } from "react-icons/io";
import { FaBuilding, FaDoorOpen, FaStoreAlt } from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi";
import { FiShield, FiZap, FiAward } from "react-icons/fi";

interface Property {
  _id: string;
  title: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  dimension: string;
  price: string;
  imgUrls?: string[];
  forSale?: boolean;
  category: string;
  status?: string;
}

const PROPERTY_CATEGORIES = [
  {
    key: "Appartment",
    title: "Featured Apartments",
    subtitle: "Move-in-ready apartments across Nepal.",
    icon: FaBuilding,
    href: "/browse-properties?category=Appartment",
    cta: "Explore apartments",
  },
  {
    key: "Room",
    title: "Trending Rooms",
    subtitle: "Affordable rooms for students and professionals.",
    icon: FaDoorOpen,
    href: "/browse-properties?category=Room",
    cta: "Browse rooms",
  },
  {
    key: "Commercial Space",
    title: "Commercial Spaces",
    subtitle: "Storefronts, offices, and warehouses ready for business.",
    icon: FaStoreAlt,
    href: "/browse-properties?category=Commercial Space",
    cta: "View commercial",
  },
];

const Home = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProperties = async () => {
    try {
      const response = await Axios.get(API_ENDPOINTS.PROPERTY.GET_ALL);
      setProperties(response.data.properties);
    } catch (error) {
      console.error("Failed to fetch property:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProperties(); }, []);

  const stats = [
    { value: properties.length || "1.2K+", label: "Active listings" },
    { value: "98%", label: "Verified landlords" },
    { value: "24h", label: "Avg. response time" },
    { value: "30+", label: "Cities covered" },
  ];

  return (
    <div className="page-reveal">
      {/* ───────── HERO ───────── */}
      <section className="relative isolate overflow-hidden hero-canvas">
        {/* Decorative cyan signature lines */}
        <div className="absolute inset-0 -z-10 pointer-events-none opacity-[0.07]"
             style={{
               backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
               backgroundSize: "64px 64px",
             }} />
        <div className="absolute top-32 -right-20 h-96 w-96 rounded-full bg-cyan-500/20 blur-[120px] -z-10" />
        <div className="absolute -bottom-24 -left-20 h-96 w-96 rounded-full bg-cyan-400/10 blur-[140px] -z-10" />

        <div className="mx-auto max-w-[1440px] px-4 lg:px-8 pt-20 pb-32 md:pt-32 md:pb-44">
          <div className="max-w-3xl">
            <span className="eyebrow-light">
              <HiOutlineSparkles /> Premium real estate
            </span>
            <h1 className="hero-title mt-8 text-5xl md:text-7xl lg:text-[88px]">
              Find a place
              <br />
              you actually <span className="cyan-highlight italic">love</span>.
            </h1>
            <p className="mt-7 max-w-xl text-base md:text-lg text-neutral-300">
              Verified listings, trusted landlords, transparent pricing. Browse
              rooms, apartments, and commercial spaces across Nepal — all in one
              effortlessly simple platform.
            </p>
          </div>

          <div className="mt-12 max-w-3xl section-reveal stagger-2">
            <Searchbar />
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-x-10 gap-y-6 max-w-3xl">
            {stats.map((stat) => (
              <div key={stat.label} className="border-l-2 border-cyan-400/70 pl-4">
                <p className="text-3xl md:text-4xl font-black tracking-tight text-white">
                  {stat.value}
                </p>
                <p className="text-[11px] uppercase tracking-widest text-neutral-400 mt-1.5">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom edge fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-neutral-50 pointer-events-none" />
      </section>

      {/* ───────── CATEGORY SECTIONS ───────── */}
      <section className="mx-auto max-w-[1440px] px-4 lg:px-8 mt-20 space-y-28">
        {PROPERTY_CATEGORIES.map((category) => {
          const filteredProperties = properties
            .filter((p) => p.category === category.key)
            .slice(0, 4);
          const Icon = category.icon;

          return (
            <div key={category.key} className="section-reveal">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
                <div>
                  <p className="eyebrow flex items-center gap-2 mb-3">
                    <Icon className="text-cyan-500" /> {category.cta}
                  </p>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight text-neutral-900">
                    {category.title}
                  </h2>
                  <p className="mt-3 text-neutral-600 max-w-xl">{category.subtitle}</p>
                </div>
                <Link to={category.href} className="btn-ghost self-start md:self-end group">
                  <span>{category.cta}</span>
                  <IoIosArrowForward className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {properties.length === 0 ? (
                  isLoading ? (
                    <p className="col-span-full text-center text-neutral-500 py-12">
                      Loading properties...
                    </p>
                  ) : (
                    <p className="col-span-full text-center text-neutral-500 py-12">
                      No properties found yet.
                    </p>
                  )
                ) : filteredProperties.length === 0 ? (
                  <p className="col-span-full text-center text-neutral-500 py-12">
                    No properties in this category yet.
                  </p>
                ) : (
                  filteredProperties.map((property) => (
                    <PropertyCard key={property._id} property={property} />
                  ))
                )}
              </div>
            </div>
          );
        })}

        {/* ───────── TRUST / VALUE BLOCK ───────── */}
        <div className="relative rounded-[2rem] bg-neutral-950 px-8 py-16 md:px-16 md:py-24 text-white overflow-hidden">
          {/* Cyan glow */}
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-cyan-400/30 blur-[120px]" />
          <div className="absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-cyan-500/20 blur-[140px]" />
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          <div className="relative max-w-3xl">
            <p className="eyebrow-light">Why RentEase</p>
            <h2 className="mt-5 text-4xl md:text-6xl font-black tracking-tight">
              Every listing verified.
              <br />
              <span className="cyan-highlight">Every landlord rated.</span>
            </h2>
            <p className="mt-6 text-neutral-300 text-base md:text-lg max-w-2xl">
              We score each landlord on identity verification, response speed,
              listing accuracy, and tenant reviews. Rent with the confidence of
              data — not promises.
            </p>
          </div>

          <div className="relative mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: FiShield, title: "Verified listings", desc: "5+ photos, real addresses, identity-checked owners." },
              { icon: FiZap, title: "Live trust score", desc: "Transparent landlord ratings on every property." },
              { icon: FiAward, title: "One platform", desc: "Rooms, apartments, commercial spaces — search once." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-neutral-800 bg-neutral-900/50 backdrop-blur p-6 hover:border-cyan-400/50 transition group">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-400/10 text-cyan-400 group-hover:bg-cyan-400 group-hover:text-neutral-900 transition">
                  <item.icon size={20} />
                </div>
                <p className="mt-5 font-bold text-lg text-white">{item.title}</p>
                <p className="text-sm text-neutral-400 mt-1.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
