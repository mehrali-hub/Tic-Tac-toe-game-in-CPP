<img width="874" height="433" alt="Screenshot 2026-06-17 171313" src="https://github.com/user-attachments/assets/44b1eb3a-3eee-473f-9e83-3664293e200b" />
# Arcane Tic-Tac-Toe

> A polished Tic-Tac-Toe experience with clean C++ OOP game logic and a modern browser interface.

Arcane Tic-Tac-Toe blends a compact C++ engine with a responsive HTML/CSS/JavaScript front end. It is designed to feel simple to play, pleasant to look at, and easy to extend if you want to experiment with WebAssembly or add new game features.

## Highlights

- Two-player game with name entry before play starts
- Clean scoreboard with rounds, scores, and turn tracking
- Restart round and new match controls
- Smart hint button for move suggestions
- Animated, responsive interface for desktop and mobile
- Optional WebAssembly integration for the C++ core
- JavaScript fallback so the game runs immediately in a browser

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Game logic | C++ |
| Browser UI | HTML, CSS, JavaScript |
| Optional native bridge | Emscripten / WebAssembly |

## Project Structure

| File | Purpose |
| --- | --- |
| [Game.h](Game.h) | Core game interface and rules |
| [Game.cpp](Game.cpp) | Board logic, turns, wins, draws, and suggestions |
| [Player.h](Player.h) | Lightweight player model |
| [Player.cpp](Player.cpp) | Player implementation |
| [main.cpp](main.cpp) | C++ entry point and exported C API |
| [index.html](index.html) | Game layout and screens |
| [style.css](style.css) | Visual design and responsive styling |
| [script.js](script.js) | UI logic and fallback game runtime |

## Quick Start

The fastest way to play is to open [index.html](index.html) in a modern browser.

If you do that, the JavaScript fallback will power the game automatically, so no build step is required.

## Optional: Run The C++ Core In The Browser

If you want the browser to use the C++ engine through WebAssembly, build it with Emscripten:

```bash
emcc main.cpp Game.cpp Player.cpp -O2 -s WASM=1 -s MODULARIZE=1 -s 'EXPORT_NAME="Module"' \
  -s EXPORTED_FUNCTIONS="['_create_game','_destroy_game','_set_names','_make_move','_get_cell','_current_player','_suggest_move','_restart_round','_new_match','_get_score','_get_round']" \
  -o game_core.js
```

After generating the file, include `game_core.js` in [index.html](index.html) before [script.js](script.js). The UI will detect `Module.cwrap` and switch to the WebAssembly-backed core.

## Native C++ Demo

You can also compile the C++ files into a small console demo:

```bash
g++ main.cpp Game.cpp Player.cpp -std=c++17 -O2 -o ttt_demo
ttt_demo
```

## What Makes It Different

This project is not just a basic grid of buttons. It combines a compact object-oriented C++ engine with a smooth front end, giving you a good example of how game logic can stay separate from presentation. That makes it a solid starter project for anyone learning OOP, browser integration, or WebAssembly.

## Notes

- The browser UI includes a local JavaScript fallback, so the game remains playable even without building the C++ core.
- The codebase is small enough to understand quickly, but structured enough to extend with features like AI opponents, online play, or additional score modes.

## License

No license file is included yet. Add one before publishing if you want to make reuse terms explicit.
