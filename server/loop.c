#include "loop.h"
#include "stdint.h"
#include "antscan.h"
#include "time.h"
#include "head.h"
#include "receiver.h"

extern int start_f;
extern int stop_f;
extern int measure_f[5];
extern char file_name[25];
extern uint16_t start_azimut, stop_azimut, n;
extern int16_t start_elev, stop_elev, resolution_elev, m, azimut_sector, resolution_azimut;
extern double reference_gain;
extern int freq_counter;
extern Frequency* freq;
time_t now;
struct tm* t;

void file_init()
{
    now = time(NULL);
    t = localtime(&now);
    for(int b = 0; b < freq_counter; b++)
    {
        freq[b].frequency = measure_f[b];

        if(file_name[1] == '0')
        {
            snprintf(freq[b].file_path, FILENAME_MAX, "./server/data/scan_%02u_%02u_%04u_%02u_%02u_%02u_%dMHz.csv",
            t->tm_mday,
            t->tm_mon + 1,
            t->tm_year + 1900,
            t->tm_hour,
            t->tm_min,
            t->tm_sec,
            freq[b].frequency);
        } else
        {
            snprintf(freq[b].file_path, FILENAME_MAX, "./server/data/%s_%dMHz.csv", file_name, freq[b].frequency);
        }

        freq[b].file_stream = fopen(freq[b].file_path, "w");
        if(freq[b].file_stream == NULL)
        {
            printf("Cannot open a file");
            clean_exit(freq, freq_counter);
            return;
        }

        fprintf(freq[b].file_stream, "START_FREQ:%d;STOP_FREQ:%d;MEASURE_FREQ:%d;REF_GAIN:%lf;\n", start_f, stop_f, freq[b].frequency, reference_gain);
        fputs("TILT/PAN;", freq[b].file_stream);
        for(int i = 0; i <= azimut_sector; i += resolution_azimut)
        {
            if(start_azimut >= 180)
            {
                fprintf(freq[b].file_stream, "%d;", (start_azimut - 360 + i) % 360);
            } else
            {
                fprintf(freq[b].file_stream, "%d;", (((start_azimut - stop_azimut) / 2) + i) % 360);
            }
        }
        fputs("\n", freq[b].file_stream);
    }
}

void measurement_loop()
{
    for(m = start_elev; m <= stop_elev; m += resolution_elev)
    {
            set_tilt_position(m);
            for(int c = 0; c < freq_counter; c++)
            {
                fprintf(freq[c].file_stream, "%d;", m);
            }
            for(n = 0; n <= azimut_sector; n += resolution_azimut)
            {
                set_pan_position(start_azimut + n);
                for(int d = 0; d < freq_counter; d++)
                {
                    fprintf(freq[d].file_stream, "%.01lf;", measure(freq[d].frequency) + reference_gain);
                }
            }
            for(int e = 0; e < freq_counter; e++)
            {
                fputs("\n", freq[e].file_stream);
                fflush(freq[e].file_stream);
            }
    }
}