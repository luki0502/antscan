#include "stdio.h"
#include "stdint.h"
#include "stdlib.h"
#include "time.h"
#include "string.h"
#include "unistd.h"
#include "sys/socket.h"
#include "arpa/inet.h"

typedef struct Frequencies
{
    int frequency;
    char file_path[FILENAME_MAX];
    FILE* file_stream;
} Frequency;

void clean_exit(Frequency* freq, int freq_counter);