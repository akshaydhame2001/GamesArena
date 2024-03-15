import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./index.css";
import arenaImg from "./assets/arena.png";

const GamesArena = () => {
  const [games, setGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://s3-ap-southeast-1.amazonaws.com/he-public-data/gamesarena274f2bf.json"
        );

        // Remove the first element from the response data array
        response.data.shift();
        setGames(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    // Filter games to find suggestions
    const suggestedGames = games
      .filter((game) => game.title.toLowerCase().includes(value.toLowerCase()))
      .reduce((acc, curr) => {
        // Group games with the same title
        const existingGame = acc.find((g) => g.title === curr.title);
        if (existingGame) {
          existingGame.platforms.push(curr.platform);
        } else {
          acc.push({
            title: curr.title,
            platforms: [curr.platform],
          });
        }
        return acc;
      }, []);
    setSuggestions(suggestedGames);
    setShowSuggestions(!!value); // Show suggestions only if the input value is not empty
  };

  const handleSort = (event) => {
    setSortBy(event.target.value);
  };

  const handleSuggestionClick = (suggestion) => {
    console.log(suggestion.title);
    setSearchTerm(suggestion.title);
    setShowSuggestions(false); // Hide suggestions after clicking
  };

  const handleInputFocus = () => {
    setShowSuggestions(true); // Show suggestions when input is focused
  };

  const handleInputBlur = () => {
    setShowSuggestions(false); // Hide suggestions when input loses focus
  };

  // Filter games based on search term
  const filteredGames = games
    .filter((game) =>
      game.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .reduce((acc, curr) => {
      // Group games with the same title
      const existingGame = acc.find((g) => g.title === curr.title);
      if (existingGame) {
        existingGame.platforms.push(`, ${curr.platform}`);
      } else {
        acc.push({
          title: curr.title,
          platforms: [curr.platform],
          score: curr.score,
          genre: curr.genre,
          editors_choice: curr.editors_choice,
        });
      }
      return acc;
    }, []);

  // Sort filtered games based on selected sorting order
  const sortedGames =
    sortBy === "asc"
      ? filteredGames.sort((a, b) => a.score - b.score)
      : sortBy === "desc"
      ? filteredGames.sort((a, b) => b.score - a.score)
      : filteredGames;

  return (
    <div className="games-arena">
      <div className="heading">
        <img src={arenaImg} alt="logo" width={100} height={70} />
        <h1 className="title">Games Arena</h1>
      </div>
      <div className="search">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={handleSearch}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          ref={inputRef}
        />
        <select onChange={handleSort} className="sort-select">
          <option value="">Sort by score</option>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
      {showSuggestions && (
        <div className="suggestions">
          {suggestions.map((suggestion, index) => (
            <div
              className="suggestion"
              key={index}
              onClick={(suggestion) => {
                console.log("Suggestion clicked:", suggestion);
                handleSuggestionClick(suggestion);
              }}
            >
              {suggestion.title}
            </div>
          ))}
        </div>
      )}
      <div className="games-list">
        {sortedGames.map((game, index) => (
          <div className="game" key={index}>
            <h2>{game.title}</h2>
            <p className="platforms">{[...game.platforms]}</p>
            <p>Rating: {game.score}/10</p>
            <p>Genre: {game.genre}</p>
            {game.editors_choice === "Y" && (
              <p className="editor-choice">Editor's Choice</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GamesArena;
