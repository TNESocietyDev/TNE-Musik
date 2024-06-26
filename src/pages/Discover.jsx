import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Error, Loader, SongCard } from "../components";
import Carousel from "../components/Carousel";
import {
  selectGenreListId,
  setActiveSong,
} from "../redux/features/playerSlice";
import { mockSongs } from "../mockSongs";
import { genres } from "../assets/constants";
import axios from "axios";

const Discover = () => {
  const dispatch = useDispatch();
  const [songs, setSongs] = useState();
  const { genreListId } = useSelector((state) => state.player);
  const { activeSong, isPlaying } = useSelector((state) => state.player);

  // Replace the OpenAI query with the mockSongs data
  const data = mockSongs;

  const genreTitle = genres.find(({ value }) => value === genreListId)?.title;

  const handleSongClick = (song) => {
    // Adjust the audio file path based on your project structure
    const audioFilePath = `/${song.audioFilePath}`;
    dispatch(setActiveSong({ song: { ...song, audioFilePath }, data, i }));
  };

  const fetchData = async () => {
    try {
      const response = await axios.get("/api/fetchsongs");
      // console.log(response.data.songs);
      if (response.status === 200) {
        fetchSpecificData(response.data.songs);
      } else {
        console.error(response.statusText);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const fetchSpecificData = async (datas) => {
    try {
      const d = Promise.all(
        datas.map(async (data) => {
          // console.log(data.uri);
          const url = data.uri.split("ipfs://")[1];
          const response = await axios.get("https://ipfs.io/ipfs/" + url);
          // console.log(response.data);

          // set other song data
          response.data.audioFilePath = response.data.audio.replace(
            "ipfs://",
            "https://ipfs.io/ipfs/"
          );
          response.data.image = response.data.image.replace(
            "ipfs://",
            "https://ipfs.io/ipfs/"
          );
          response.data.id = data._id
          response.data.createdAt = data.createdAt

          return response.data;
        })
      );
      setSongs(await d);
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await fetchData();
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  return (
    <div className="flex flex-col">
      {/* <div className="w-full flex justify-between items-center sm:flex-row flex-col mt-4 mb-10">
        <h2 className="font-bold text-3xl text-white text-left">
          Discover {genreTitle}
        </h2>

        <div class="relative">
          <select
            onChange={(e) => dispatch(selectGenreListId(e.target.value))}
            value={genreListId || "pop"}
            class="block appearance-none w-full bg-gray-800 text-gray-200 py-3 px-4 pr-8 outline-none rounded leading-tight focus:outline-none focus:bg-black focus:border-gray-500"
            id="grid-genre"
          >
            {genres.map((genre) => (
              <option key={genre.value} value={genre.value}>
                {genre.title}
              </option>
            ))}
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <svg
              class="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div> */}
      <div className="">
        <Carousel />
      </div>

      <h2 className="text-white my-2 font-bold text-2xl">Recomended</h2>
      <div className="flex flex-wrap sm:justify-start justify-center gap-8">
        {songs?.map((song, i) => (
          <SongCard
            key={song.id}
            song={song}
            isPlaying={isPlaying}
            activeSong={activeSong}
            data={data}
            i={i}
            onSongClick={() => handleSongClick(song)}
          />
        ))}
      </div>
    </div>
  );
};

export default Discover;
