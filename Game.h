#pragma once
#include <array>
#include <string>

// Game: core Tic-Tac-Toe logic implemented in C++ using clean OOP.
// - Board indices: 0..8 (row-major)
// - Cells: 0 = empty, 1 = X (player1), 2 = O (player2)

class Game {
public:
    Game();
    void setPlayerNames(const std::string &p1, const std::string &p2);
    void newMatch();            // reset scores and rounds
    void restartRound();        // clear board but keep scores/rounds
    bool makeMove(int index);   // place mark for current player, returns success
    int getCell(int index) const; // 0/1/2
    int currentPlayer() const;  // 1 or 2
    bool isWin(int &winner, int &a, int &b, int &c) const; // returns winning triple
    bool isDraw() const;
    int getRound() const;
    int getScore(int player) const; // 1 or 2
    std::array<int,9> getBoard() const;
    // Suggest best move index for current player (-1 none)
    int suggestMove() const;
    // For external UI to set names directly
    std::string playerName(int player) const; // 1 or 2

private:
    std::array<int,9> board; 
    int cur; // 1 or 2
    int round;
    int score1, score2;
    std::string name1, name2;

    int minimax(std::array<int,9> b, int player) const; // returns score
    int findBest(const std::array<int,9>& b, int player) const;
    int checkWinner(const std::array<int,9>& b) const; // 0/1/2
};
