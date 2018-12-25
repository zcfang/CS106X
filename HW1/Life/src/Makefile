all: main

main: life.o lifegrid.o
	g++ life.o lifegrid.o -o $@

life.o: life.cpp
	g++ -c life.cpp

lifegrid.o: LifeGrid.cpp LifeGrid.hpp
	g++ -c $< -o $@

run: main
	./main

clean:
	rm -f main *.o *.out