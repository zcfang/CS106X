#include <iostream>
#include <fstream>
#include <string>

void welcome_statement();
void prompt_file(std::ifstream &text_file);
std::string read_file(std::ifstream &text_file);
std::string parse_line(std::string line);
std::string get_placeholder(std::string line);
std::string handle_placeholder(std::string line,
                               size_t first_pos,
                               size_t str_len);
bool is_vowel(std::string placeholder);
void print_story(std::string story);

int main() {
    std::ifstream text_file;
    std::string story;

    welcome_statement();
    prompt_file(text_file);
    story = read_file(text_file);
    print_story(story);
    text_file.close();

    return 0;
}

void welcome_statement() {
    std::cout << "Welcome to CS 106X Mad Libs!\n"
              << "I will ask you to provide various words\n"
              << "and phrases to fill in a story.\n"
              << "At the end, I will display your story to you.\n" << std::endl;
}

void prompt_file(std::ifstream &text_file) {
    std::string filename;
    bool file_open = false;

    while (!file_open) {
        std::cout << "Mad Lib input file? ";
        std::getline(std::cin, filename);
        // std::cin >> filename;
        filename = "../res/" + filename;
        text_file.open(filename);
        file_open = text_file.is_open();
        if (!file_open) {
            std::cout << "Unable to open that file.  Try again." << std::endl;
        }
    }

}

std::string read_file(std::ifstream &text_file) {
    std::string line;
    std::string final_story = "";

    std::cout << std::endl;
    while (std::getline(text_file, line)) {
        line = parse_line(line);
        final_story = final_story + line + "\n";
    }

    return final_story;
}

std::string parse_line(std::string line) {
    line = get_placeholder(line);

    return line;
}

std::string get_placeholder(std::string line) {
    std::string first_delim = "<";
    std::string second_delim = ">";
    size_t first_pos = line.find(first_delim);
    size_t second_pos;
    size_t str_len;

    while (first_pos != std::string::npos) {
        second_pos = line.find(second_delim, first_pos);
        if (second_pos != std::string::npos) {
            str_len = second_pos - first_pos + 1;
            line = handle_placeholder(line, first_pos, str_len);
            first_pos = line.find(first_delim);
        } else {
            first_pos = line.find(first_delim, second_pos);
        }
    }

    return line;
}

std::string handle_placeholder(std::string line,
                               size_t first_pos,
                               size_t str_len) {
    std::string placeholder = line.substr(first_pos + 1, str_len - 2);
    std::string a_an = is_vowel(placeholder) ? "an ":"a ";
    std::string replacement_str;

    std::cout << "Please type " << a_an << placeholder << ": ";
    std::getline(std::cin, replacement_str);
    line.replace(first_pos, str_len, replacement_str);

    return line;
}

bool is_vowel(std::string placeholder) {
    char first_letter = placeholder[0];
    
    switch (first_letter) {
        case 'a':
        case 'A':
        case 'e':
        case 'E':
        case 'i':
        case 'I':
        case 'o':
        case 'O':
        case 'u':
        case 'U':
            return true;
        default:
            return false;
    }
}

void print_story(std::string story) {
    std::cout << "\nYour Mad Lib story:\n" << story;
}
