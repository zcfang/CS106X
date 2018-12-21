all: main

main: madlibs.o
	g++ madlibs.o -o $@

madlibs.o: madlibs.cpp
	g++ -c madlibs.cpp

run: main
	./main

clean:
	rm -f main *.o *.out