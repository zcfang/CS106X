## Mad Libs

This is an assignment for Stanford's CS106X: Programming Abstractions (Accelerated), Autumn 2017 course. As described in the homework handout, the purpose of this assignment is understand C++ functions, strings, reading files, using libraries, and decomposing large problems. A brief description of this program:

"Mad Libs" are short stories that have blanks called placeholders to be filled in. In the non-computerized version of this game, one person asks a second person to fill in each of the placeholders without the second person knowing the overall story. (For example, "Tell me a noun: ___") Once all placeholders are filled in, the second person is shown the resulting story, often with humorous results.

In this assignment you prompt the user to enter a file name representing a Mad Lib story to be filled in, re-prompting until the user types the name of a file that exists. Then the program reads the input file, prompting the user to fill in any placeholders that are found without showing the user the rest of the story. Once the user has filled in all of the placeholders, the entire completed story is shown.

A complete description of the requirements for this assignment can be found [here](./Mad-Libs.htm)

## Build Steps

### Java Demo

Stanford provides a Java program for how this program should execute. If the output of this program conflicts with the specs, the specs will take precedent. To execute the Java demo:

```bash
cd CS106X/HW1/MadLibs
java -jar madlibs-demo.jar
```

### Make

`Make` is used to simplify the build process. To build and run execute the following:

```bash
cd src
make run
```