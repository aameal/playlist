import { useState } from "react";

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setQuery("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-center border border-gray-300 rounded-full bg-white shadow-sm hover:shadow-md transition duration-200">
        <input
          type="text"
          className="flex-grow px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none rounded-l-full"
          placeholder="노래 제목 또는 가수 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-r-full hover:bg-gray-200 transition"
          title="검색"
        >
          🔍
        </button>
      </div>
    </form>
  );
}

export default SearchBar;
