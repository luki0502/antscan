CC = gcc
CPPFLAGS += -D_GNU_SOURCE

DIALECT = -std=c18
CFLAGS += $(DIALECT) -od -g -W -D_DEFAULT_SOURCE -Wall -fno-common -Wmissing-declarations
LIBS = -lm -lrsvisa
LDFLAGS =

all: antscan

%.o: server/%.c server/*.h
	$(CC) $(CPPFLAGS) $(CFLAGS) -c $< -o $@

antscan: server/antscan.o server/head.o server/receiver.o
	$(CC) -g -o server/$@ $^ $(LDFLAGS) $(LIBS)

clean:
	rm -f server/*.o server/antscan
