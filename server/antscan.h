#include "stdio.h"

#define NOTUSED(V) ((void)V)
#define WSBUFFERSIZE 8192 /* Byte */

#define WS_DEFAULT_IP "127.0.0.1"
#define WS_DEFAULT_PORT 10024

typedef enum jarray_index_e
{
    SERVER_CMD = 0,
    FILENAME,
    AZIMUTH_ANGLE,
    AZIMUT_RESOLUTION,
    ELEVATION_START,
    ELEVATION_STOP,
    ELEVATION_RESOLUTION,
    START_FREQUENCY,
    STOP_FREQUENCY,
    TEST_FREQUENCY,
    REFERENCE_GAIN
} jarray_index_e;

typedef enum scan_status_e
{
    STOPPED = 1,
    RUNNING = 2,
    PAUSED = 3,
    CALIBRATED = 4
} scan_status_e;

typedef enum server_command_e
{
    SERVER_CMD_NULL = 0,
    SERVER_CMD_SCAN_START,
    SERVER_CMD_SCAN_STOP,
    SERVER_CMD_SCAN_PAUSE,
    SERVER_CMD_CALIBRATE_PT,
    SERVER_CMD_SET_PAN,
    SERVER_CMD_SET_TILT,
    SERVER_CMD_SET_HOME,
    SERVER_CMD_CALIBRATE_ANTENNA,
    SERVER_CMD_STATUS,
    SERVER_CMD_MEASUREMENT_POINT
} server_command_e;

typedef enum app_msg_type_e
{
    MSG_PRIMARY = 0,
    MSG_SECONDARY,
    MSG_SUCCESS,
    MSG_INFO,
    MSG_WARNING,
    MSG_DANGER,
    MSG_LIGHT,
    MSG_DARK
} app_msg_type_e;

typedef struct Frequencies
{
    int frequency;
    char file_path[FILENAME_MAX];
    FILE* file_stream;
} Frequency;

void clean_exit(Frequency* freq, int freq_counter);