import { useState } from "react";
import { IoSearch } from "react-icons/io5";
import { useNavigate } from "react-router";

const Searchbar = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    const trimmedQuery = query.trim();
    if (trimmedQuery !== "") {
      navigate(`/browse-properties?search=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="w-full xl:w-[860px] flex items-center gap-2 bg-white border border-neutral-200 rounded-2xl shadow-2xl shadow-black/10 px-2 py-2 ring-1 ring-cyan-400/0 hover:ring-cyan-400/30 transition">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-neutral-900 text-cyan-400">
        <IoSearch className="h-5 w-5" />
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 px-2 text-sm md:text-base text-neutral-900 placeholder:text-neutral-400 outline-none bg-transparent font-medium"
        type="text"
        placeholder="Search by city, neighborhood, or property title"
      />
      <button onClick={handleSearch} className="btn-cyan !py-2.5 !px-6 hidden sm:inline-flex">
        Search
      </button>
      <button
        onClick={handleSearch}
        aria-label="Search"
        className="grid sm:hidden h-11 w-11 place-items-center rounded-xl bg-cyan-400 text-neutral-900">
        <IoSearch className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Searchbar;
