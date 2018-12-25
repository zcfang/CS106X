#include <iostream>
#include <fstream>
#include <stdexcept>
#include "LifeGrid.hpp"

/*
 * Prints welcome statement for this program
 */
void welcome_statement();

/*
 * Continuously prompts user for input file. Re-prompt is input is incorrect
 *
 * Args:
 *     text_file (std::ifstream): An instance of std::ifstream used to open and
 *     read file  
 */
void prompt_file(std::ifstream &text_file);

/*
 * Ask user to enter state of program. The three possible states are 
 * a)nimate, t)ick, q)uit?
 *
 * Args:
 *     lifegrid (LifeGrid): A instance of LifeGrid. This object abstracts the
 *     2D space bacteria live in.
 *
 * Returns:
 *     A boolean value indicating whether to load a new file or not.
 */
bool get_state(LifeGrid &lifegrid);

int main() {
    std::ifstream text_file;
    LifeGrid lifegrid;
    bool new_file = false;

    welcome_statement();
    while (!new_file) {
        prompt_file(text_file);
        lifegrid.init_grid(text_file);
        new_file = get_state(lifegrid);
        text_file.close();
    }

    return 0;
}

void welcome_statement() {
    std::cout << "Welcome to the CS 106X Game of Life!\n"
              << "This program simulates the lifecycle of a bacterial colony.\n"
              << "Cells (X) live and die by the following rules:\n"
              << "* A cell with 1 or fewer neighbors dies.\n"
              << "* Locations with 2 neighbors remain stable.\n"
              << "* Locations with 3 neighbors will create life.\n"
              << "* A cell with 4 or more neighbors dies.\n" << std::endl;
}

void prompt_file(std::ifstream &text_file) {
    std::string filename;
    bool file_open = false;

    while (!file_open) {
        std::cout << "Grid input file name? ";
        std::getline(std::cin, filename);
        filename = "../res/" + filename;
        text_file.open(filename);
        file_open = text_file.is_open();
        if (!file_open) {
            std::cout << "Unable to open that file.  Try again." << std::endl;
        }
    }
}

bool get_state(LifeGrid &lifegrid) {
    std::string input_value;
    bool quit = false;
    int pause_ms = 100;
    char state;
    char load_new_file;
    int frame_number;

    while(!quit) {
        std::cout << "a)nimate, t)ick, q)uit? ";
        std::getline(std::cin, input_value);
        state = input_value[0];
        switch (state) {
            case 'a':
                frame_number = 0;
                while (!frame_number) {
                    try {
                        std::cout << "How many frames? ";
                        std::getline(std::cin, input_value);
                        frame_number = std::stoi(input_value);
                    }
                    catch (std::invalid_argument) {
                        std::cout << "Illegal integer format. Try again."
                                  << std::endl;
                    }
                }
                lifegrid.animate(frame_number, pause_ms);
                break;
            case 't':
                lifegrid.tick();
                break;
            case 'q':
                std::cout << "Load another file? (y/n) ";
                std::getline(std::cin, input_value);
                load_new_file = input_value[0];
                quit = load_new_file != 'y';
                if (quit) {
                    std::cout << "Have a nice Life!" << std::endl;
                    return true;
                } else {
                    return false;
                }
                break;
        }
    }
}
