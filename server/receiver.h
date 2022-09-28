#ifndef RECEIVER_H
#define RECEIVER_H

#include "stdio.h"
#include "stdint.h"
#include "string.h"
#include "time.h"
#include "rsvisa/visa.h"
#include <stdlib.h>

void init_receiver(int start_freq, int stop_freq);

double measure(int measure_freq);

#endif