#include <iostream>
#include <string>
#include <fstream>
#include "LifeGrid.hpp"

LifeGrid::LifeGrid() {

}

void LifeGrid::init_grid(std::ifstream &text_file) {
    std::string line;

    std::getline(text_file, line);
    row = std::stoi(line);
    std::getline(text_file, line);
    col = std::stoi(line);

    grid.clear();
    grid.resize(row);
    for (int i = 0; i < row; i++) {
        std::getline(text_file, line);
        std::cout << line << std::endl;
        populate_bacteria(line, i);
    }
}

void LifeGrid::tick() {
    int neighbor_count;
    std::vector<std::vector<bool> > new_grid;

    for (int i = 0; i < row; i++) {
        std::vector<bool> new_row(col, false);
        for (int j = 0; j < col; j++) {
            neighbor_count = get_neighbor_count(i, j);
            if (neighbor_count == 2) {
                new_row[j] = grid[i][j];
            } else if (neighbor_count == 3) {
                new_row[j] = true;
            }
        }
        new_grid.push_back(new_row);
    }
    grid = new_grid;
    print_grid();
}

void LifeGrid::animate(int frame_number, int pause_ms) {
    for (int i = 0; i < frame_number; i++) {
        std::cout <<
        "==================== (console cleared) ===================="
        << std::endl;
        tick();
    }
}

void LifeGrid::print_grid() {
    for (int i = 0; i < row; i++) {
        for (int j = 0; j < col; j++) {
            std::cout << ((grid[i][j]) ? "X":"-");
        }
        std::cout << std::endl;
    }
}

void LifeGrid::populate_bacteria(std::string line, int index) {
    std::string delimiter = "X";
    std::string replacement_str = "-";
    size_t bacteria_pos = line.find(delimiter);
    size_t str_len = 1;
    std::vector<bool> each_row(col, false);

    while (bacteria_pos != std::string::npos) {
        each_row[bacteria_pos] = true;
        line.replace(bacteria_pos, str_len, replacement_str);
        bacteria_pos = line.find(delimiter);
    }
    grid[index] = each_row;
}

int LifeGrid::get_neighbor_count(int index_row, int index_col) {
    int count = 0;
    if (index_row == 0 || index_row == row - 1 ||
        index_col == 0 || index_col == col - 1) {
        count = handle_edges(index_row, index_col);

    } else {
        count += (grid[index_row][index_col - 1]);
        count += (grid[index_row][index_col + 1]);
        count += (grid[index_row - 1][index_col]);
        count += (grid[index_row + 1][index_col]);
        count += (grid[index_row - 1][index_col - 1]);
        count += (grid[index_row - 1][index_col + 1]);
        count += (grid[index_row + 1][index_col - 1]);
        count += (grid[index_row + 1][index_col + 1]);
    }

    return count;
}

int LifeGrid::handle_edges(int index_row, int index_col) {
    int count = 0;
    if ((index_row == 0 && index_col == 0) ||
        (index_row == 0 && index_col == row - 1) ||
        (index_row == row - 1 && index_col == 0) ||
        (index_row == row - 1 && index_col == col - 1)) {
        count = handle_corners(index_row, index_col);
    } else if (index_row == 0) {
        count += grid[index_row][index_col - 1];
        count += grid[index_row][index_col + 1];
        count += grid[index_row + 1][index_col];
        count += grid[index_row + 1][index_col - 1];
        count += grid[index_row + 1][index_col + 1];
        count += grid[row - 1][index_col];
        count += grid[row - 1][index_col - 1];
        count += grid[row - 1][index_col + 1];
    } else if (index_row == row - 1) {
        count += grid[index_row][index_col - 1];
        count += grid[index_row][index_col + 1];
        count += grid[index_row - 1][index_col];
        count += grid[index_row - 1][index_col - 1];
        count += grid[index_row - 1][index_col + 1];
        count += grid[0][index_col];
        count += grid[0][index_col - 1];
        count += grid[0][index_col + 1];
    } else if (index_col == 0) {
        count += grid[index_row - 1][index_col];
        count += grid[index_row + 1][index_col];
        count += grid[index_row][index_col + 1];
        count += grid[index_row - 1][index_col + 1];
        count += grid[index_row + 1][index_col + 1];
        count += grid[index_row][col - 1];
        count += grid[index_row - 1][col - 1];
        count += grid[index_row + 1][col - 1];
    } else if (index_col == col - 1) {
        count += grid[index_row - 1][index_col];
        count += grid[index_row + 1][index_col];
        count += grid[index_row][index_col - 1];
        count += grid[index_row - 1][index_col - 1];
        count += grid[index_row + 1][index_col - 1];
        count += grid[index_row][0];
        count += grid[index_row - 1][0];
        count += grid[index_row + 1][0];
    }

    return count;
}

int LifeGrid::handle_corners(int index_row, int index_col) {
    int count = 0;

    if (index_row == 0 && index_col == 0) {
        count += grid[index_row][index_col + 1];
        count += grid[index_row + 1][index_col];
        count += grid[index_row + 1][index_col + 1];
        count += grid[index_row][col - 1];
        count += grid[index_row + 1][col - 1];
        count += grid[row - 1][index_col];
        count += grid[row - 1][index_col + 1];
        count += grid[row - 1][col - 1];
    } else if (index_row == 0 && index_col == row - 1) {
        count += grid[index_row][index_col - 1];
        count += grid[index_row + 1][index_col - 1];
        count += grid[index_row + 1][index_col];
        count += grid[index_row][0];
        count += grid[index_row + 1][0];
        count += grid[row - 1][index_col];
        count += grid[row - 1][index_col - 1];
        count += grid[row - 1][0];
    } else if (index_row == row - 1 && index_col == 0) {
        count += grid[index_row][index_col + 1];
        count += grid[index_row - 1][index_col];
        count += grid[index_row - 1][index_col + 1];
        count += grid[index_row][col - 1];
        count += grid[index_row - 1][col - 1];
        count += grid[0][index_col];
        count += grid[0][index_col + 1];
        count += grid[0][col - 1];
    } else if (index_row == row - 1 && index_col == col - 1) {
        count += grid[index_row][index_col - 1];
        count += grid[index_row - 1][index_col];
        count += grid[index_row - 1][index_col - 1];
        count += grid[0][index_col];
        count += grid[0][index_col - 1];
        count += grid[index_row][0];
        count += grid[index_row - 1][0];
        count += grid[0][0];
    }

    return count;
}

LifeGrid::~LifeGrid() {
    // delete grid;
}
