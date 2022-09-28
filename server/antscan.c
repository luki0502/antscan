#include "antscan.h"
#include "head.h"
#include "receiver.h"

void clean_exit(Frequency* freq, int freq_counter)
{
    close_socket();

    for(int f = 0; f < freq_counter; f++)
    {
        fclose(freq[f].file_stream);
    }

    free(freq);
}

int main()
{
    clean();

    if(create_socket() == -1)
    {
        return 0;
    }

    // Send connection request to server
    if (connect_server() == -1)
    {
        close_socket();
        return 0;
    }

    //self_check();

    int start_f;
    int stop_f;
    int measure_f[5];
    char file_name[25];
    memset(file_name, '0', sizeof(file_name));
    char change[5];
    uint16_t start_azimut, stop_azimut, n;
    int16_t start_elev, stop_elev, resolution_elev, m, azimut_sector, resolution_azimut;
    double reference_gain = 0;
    int freq_counter = 0;
    time_t now = time(NULL);
    struct tm* t = localtime(&now);

    printf("file name [enter for default]: ");
    gets(file_name);
    printf("gain reference antenna: ");
    scanf("%lf", &reference_gain);
    do
    {
        printf("azimut angle [0~360]: ");
        scanf("%hd", &azimut_sector);
    } while (azimut_sector <= 0);
    do
    {
        printf("azimut resolution: ");
        scanf("%hd", &resolution_azimut);
    } while (resolution_azimut <= 0);
    printf("start angle elevation [-90~90]: ");
    scanf("%hu", &start_elev);
    printf("stop angle elevation [-90~90]: ");
    scanf("%hu", &stop_elev);
    do
    {
        printf("elevation resulution: ");
        scanf("%hd", &resolution_elev);
    } while (resolution_elev <= 0);
    do
    {
        printf("start frequency [MHz]: ");
        scanf("%d", &start_f);
    } while (start_f < 0);
    do
    {
        printf("stop frequency [MHz]: ");
        scanf("%d", &stop_f);
    } while (stop_f < 0 || stop_f <= start_f);
    do
    {
        freq_counter += 1;
        printf("measure frequency [MHz; end = 0]: ");
        scanf("%d", &measure_f[freq_counter - 1]);
    } while (measure_f[freq_counter - 1] != 0);

    init_receiver(start_f, stop_f);

    printf("change antenna, when finished enter 0 \n");
    scanf("%s", change);

    start_azimut = 360 - (azimut_sector / 2.0);
    stop_azimut = azimut_sector / 2.0;

    freq_counter -= 1;

    Frequency* freq = (Frequency*) malloc(freq_counter * sizeof(Frequency));
    if(freq == NULL)
    {
        printf("Malloc error");
        clean_exit(freq, freq_counter);
        return 0;
    }

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
            return 0;
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

    clean_exit(freq, freq_counter);

    return 0;
}