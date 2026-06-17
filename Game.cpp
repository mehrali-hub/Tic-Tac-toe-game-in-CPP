#include "Game.h"
#include <algorithm>
#include <limits>

using namespace std;

Game::Game() {
    newMatch();
}

void Game::setPlayerNames(const std::string &p1, const std::string &p2) {
    name1 = p1.empty() ? std::string("Player 1") : p1;
    name2 = p2.empty() ? std::string("Player 2") : p2;
}

void Game::newMatch() {
    board.fill(0);
    cur = 1;
    round = 1;
    score1 = score2 = 0;
    name1 = "Player 1";
    name2 = "Player 2";
}

void Game::restartRound() {
    board.fill(0);
    cur = (round % 2 == 1) ? 1 : 2; // alternate starting player
}

bool Game::makeMove(int index) {
    if (index < 0 || index >= 9) return false;
    if (board[index] != 0) return false;
    board[index] = cur;

    int winner = checkWinner(board);
    if (winner != 0) {
        if (winner == 1) ++score1; else ++score2;
        ++round;
    } else if (std::all_of(board.begin(), board.end(), [](int v){return v!=0;})) {
        ++round; // draw increments round but no score
    } else {
        cur = (cur == 1) ? 2 : 1;
    }
    return true;
}

int Game::getCell(int index) const { return (index>=0 && index<9) ? board[index] : -1; }
int Game::currentPlayer() const { return cur; }

bool Game::isWin(int &winner, int &a, int &b, int &c) const {
    winner = checkWinner(board);
    if (winner==0) return false;
    const int lines[8][3] = {{0,1,2},{3,4,5},{6,7,8},{0,3,6},{1,4,7},{2,5,8},{0,4,8},{2,4,6}};
    for (auto &ln: lines) {
        if (board[ln[0]]==winner && board[ln[1]]==winner && board[ln[2]]==winner) {
            a=ln[0]; b=ln[1]; c=ln[2];
            return true;
        }
    }
    return false;
}

bool Game::isDraw() const {
    return checkWinner(board)==0 && std::all_of(board.begin(), board.end(), [](int v){return v!=0;});
}

int Game::getRound() const { return round; }
int Game::getScore(int player) const { return (player==1)?score1:score2; }
std::array<int,9> Game::getBoard() const { return board; }

std::string Game::playerName(int player) const { return (player==1) ? name1 : name2; }

// Minimax implementation: player argument is the maximizing player (1 or 2)
int Game::checkWinner(const std::array<int,9>& b) const {
    const int lines[8][3] = {{0,1,2},{3,4,5},{6,7,8},{0,3,6},{1,4,7},{2,5,8},{0,4,8},{2,4,6}};
    for (auto &ln: lines) {
        if (b[ln[0]]!=0 && b[ln[0]]==b[ln[1]] && b[ln[1]]==b[ln[2]]) return b[ln[0]];
    }
    return 0;
}

int Game::minimax(std::array<int,9> b, int player) const {
    int winner = checkWinner(b);
    if (winner==1) return (player==1)? 100 : -100;
    if (winner==2) return (player==2)? 100 : -100;
    if (std::all_of(b.begin(), b.end(), [](int v){return v!=0;})) return 0;

    int curPlayer = 1;
    int countX = 0, countO = 0;
    for (int v: b) { if (v==1) ++countX; if (v==2) ++countO; }
    curPlayer = (countX<=countO)?1:2;

    int bestScore = (curPlayer==player)? std::numeric_limits<int>::min() : std::numeric_limits<int>::max();
    for (int i=0;i<9;++i) {
        if (b[i]==0) {
            b[i] = curPlayer;
            int score = minimax(b, player);
            b[i] = 0;
            if (curPlayer==player) {
                bestScore = std::max(bestScore, score-1); // prefer faster wins
            } else {
                bestScore = std::min(bestScore, score+1);
            }
        }
    }
    return bestScore;
}

int Game::findBest(const std::array<int,9>& b, int player) const {
    int bestIdx = -1;
    int bestScore = std::numeric_limits<int>::min();
    for (int i=0;i<9;++i) {
        if (b[i]==0) {
            auto nb = b; nb[i] = player;
            int score = minimax(nb, player);
            if (score > bestScore) { bestScore = score; bestIdx = i; }
        }
    }
    return bestIdx;
}

int Game::suggestMove() const {
    // Quick immediate win/block checks
    // 1) can current player win next
    for (int i=0;i<9;++i) {
        if (board[i]==0) {
            auto nb = board; nb[i] = cur;
            if (checkWinner(nb)==cur) return i;
        }
    }
    // 2) can opponent win next? block
    int opp = (cur==1)?2:1;
    for (int i=0;i<9;++i) {
        if (board[i]==0) {
            auto nb = board; nb[i] = opp;
            if (checkWinner(nb)==opp) return i;
        }
    }
    // 3) otherwise run minimax-based findBest
    return findBest(board, cur);
}
