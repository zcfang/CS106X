#include <vector>

class LifeGrid
{
public:
    int row;
    int col;
    std::vector<std::vector<bool> > grid;
    LifeGrid();
    void init_grid(std::ifstream &text_file);
    void tick();
    void animate(int frame_number, int pause_ms);
    void print_grid();
    ~LifeGrid();
private:
    void populate_bacteria(std::string line, int index);
    int get_neighbor_count(int index_row, int index_col);
    int handle_edges(int index_row, int index_col);
    int handle_corners(int index_row, int index_col);
};