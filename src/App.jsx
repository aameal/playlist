import { useState, useEffect } from "react";
import SearchBar from "./components/SearchBar";
import { db } from "./firebase";
import {
  ref,
  push,
  onValue,
  remove,
  set,
} from "firebase/database";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

const API_KEY = "AIzaSyCAQ4fe7HFh-xZ3cYCRer6Jmj3rHr9cyBw";

function App() {
  const [results, setResults] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [nowPlaying, setNowPlaying] = useState(null);

  const searchYouTube = async (query) => {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(
        query
      )}&key=${API_KEY}`
    );
    const data = await response.json();
    setResults(data.items);
  };

  const addToPlaylist = (video) => {
    const isDuplicate = playlist.some(
      (song) => song.videoId === video.id.videoId
    );
    if (isDuplicate) {
      alert("⚠️ 이미 추가된 곡입니다!");
      return;
    }
    push(ref(db, "playlist"), {
      title: video.snippet.title,
      videoId: video.id.videoId,
      thumbnail: video.snippet.thumbnails.default.url,
      liked: false,
    });
  };

  const removeFromPlaylist = (key) => {
    remove(ref(db, `playlist/${key}`));
  };

  const toggleLike = (song) => {
    const songRef = ref(db, `playlist/${song.key}`);
    const updated = { ...song, liked: !song.liked };
    delete updated.key;
    set(songRef, updated);
  };

  useEffect(() => {
    const playlistRef = ref(db, "playlist");
    onValue(playlistRef, (snapshot) => {
      const data = snapshot.val();
      const list = data
        ? Object.entries(data).map(([key, value]) => ({ key, ...value }))
        : [];
      setPlaylist(list);
    });
  }, []);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(playlist);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setPlaylist(reordered);
  };

  const likedCount = playlist.filter((song) => song.liked).length;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* 상단 고정 헤더 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-red-600">MyTube 🎵</h1>
          <div className="w-full max-w-md">
            <SearchBar onSearch={searchYouTube} />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-16">
        {/* 현재 재생 중인 영상 */}
        {nowPlaying && (
          <section className="flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4">🎬 Now Playing</h2>
            <div className="aspect-video w-full max-w-3xl rounded-lg overflow-hidden shadow">
              <iframe
                src={`https://www.youtube.com/embed/${nowPlaying}?autoplay=1`}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                title="Now Playing"
                allowFullScreen
              />
            </div>
          </section>
        )}

        {/* 플레이리스트 */}
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h2 className="text-2xl font-bold">📃 Playlist</h2>
            <span className="text-sm text-gray-600">💖 좋아요: {likedCount}곡</span>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="playlist">
              {(provided) => (
                <ul
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center"
                >
                  {playlist.map((song, index) => (
                    <Draggable key={song.key} draggableId={song.key} index={index}>
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white shadow-md hover:shadow-lg transition rounded-lg overflow-hidden w-full max-w-xs"
                        >
                          <img
                            src={song.thumbnail}
                            alt="Thumbnail"
                            className="w-full h-48 object-cover cursor-pointer"
                            onClick={() => setNowPlaying(song.videoId)}
                          />
                          <div className="p-4">
                            <p className="font-semibold truncate">{song.title}</p>
                            <div className="mt-2 flex justify-between text-sm">
                              <button
                                onClick={() => removeFromPlaylist(song.key)}
                                className="text-red-500 hover:underline"
                              >
                                🗑 삭제
                              </button>
                              <button
                                onClick={() => toggleLike(song)}
                                className="text-pink-500 hover:underline"
                              >
                                {song.liked ? "💖" : "🤍"} 좋아요
                              </button>
                            </div>
                          </div>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </section>

        {/* 검색 결과 */}
        <section>
          <h2 className="text-2xl font-bold mb-4">🔍 검색 결과</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
            {results.map((video) => (
              <div
                key={video.id.videoId}
                className="bg-white shadow-md hover:shadow-lg transition rounded-lg overflow-hidden w-full max-w-xs"
              >
                <img
                  src={video.snippet.thumbnails.high.url}
                  alt="thumbnail"
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <p className="font-semibold truncate">{video.snippet.title}</p>
                  <button
                    onClick={() => addToPlaylist(video)}
                    className="mt-2 text-blue-600 hover:underline text-sm"
                  >
                    ➕ 추가
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
