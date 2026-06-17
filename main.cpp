#include "Game.h"
#include <iostream>
#include <cstring>
using namespace std;


extern "C" {

// opaque pointer to Game
void* create_game() { return new Game(); }
void destroy_game(void* g) { delete static_cast<Game*>(g); }

void set_names(void* g, const char* n1, const char* n2) {
    if (!g) return;
    Game* gm = static_cast<Game*>(g);
    gm->setPlayerNames(n1?std::string(n1):std::string(), n2?std::string(n2):std::string());
}

int make_move(void* g, int idx) {
    if (!g) return 0;
    return static_cast<Game*>(g)->makeMove(idx) ? 1 : 0;
}

int get_cell(void* g, int idx) {
    if (!g) return -1;
    return static_cast<Game*>(g)->getCell(idx);
}

int current_player(void* g) { if (!g) return 0; return static_cast<Game*>(g)->currentPlayer(); }
int suggest_move(void* g) { if (!g) return -1; return static_cast<Game*>(g)->suggestMove(); }
void restart_round(void* g) { if (!g) return; static_cast<Game*>(g)->restartRound(); }
void new_match(void* g) { if (!g) return; static_cast<Game*>(g)->newMatch(); }
int get_score(void* g, int player) { if (!g) return 0; return static_cast<Game*>(g)->getScore(player); }
int get_round(void* g) { if (!g) return 0; return static_cast<Game*>(g)->getRound(); }

}

#ifndef __EMSCRIPTEN__
int main(){
    cout << "Arcane Tic-Tac-Toe (C++ core) - demo\n";
    Game g;
    g.setPlayerNames("Alice","Bob");
    cout<<"Created game for Alice and Bob\n";
    return 0;
}
#endif
