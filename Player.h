#pragma once
#include <string>

struct Player {
    std::string name;
    int id; // 1 or 2
    Player() : name("Player"), id(0) {}
    Player(const std::string &n, int i) : name(n), id(i) {}
};
