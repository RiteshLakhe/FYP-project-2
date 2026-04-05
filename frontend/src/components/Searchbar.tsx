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
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="w-full xl:w-[900px] h-auto p-2 flex items-center gap-2 bg-white border rounded-xs">
      <div className="w-6 h-6">
        <IoSearch className="w-full h-full text-gray-500" />
      </div>
      <div className="flex-grow flex items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full text-sm md:text-base text-[#2e2e2e] outline-none"
          type="text"
          placeholder="Search for properties"
        />
        <button
          onClick={handleSearch}
          className="border py-2 px-4 md:px-8 bg-[#1E293B] text-white rounded-sm">
          Search
        </button>
      </div>
    </div>
  );
};

export default Searchbar;
