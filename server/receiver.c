#include "receiver.h"

#ifdef REAL
static char idnQuery[] = "*IDN?\n";
static ViStatus status = VI_SUCCESS;
static ViUInt32 returnCount = 0;
static ViSession rmHandle, scopeHandle;
static char idnResponse[1024];
static char ressourceString1[] = "TCPIP::192.168.1.128";
#endif

void init_receiver(int start_freq, int stop_freq)
{
    #ifdef REAL
    status = viOpenDefaultRM (&rmHandle);

    status = viOpen(rmHandle, ressourceString1, VI_NULL, VI_NULL, &scopeHandle);
    status = viClear(scopeHandle);

    //Reset
    sprintf(idnQuery, "*RST");
    status = viWrite(scopeHandle, (ViBuf)idnQuery, (ViUInt32)strlen(idnQuery), VI_NULL);

    //Spectrum Measurement
    sprintf(idnQuery, "INST:SEL SAN");
    status = viWrite(scopeHandle, (ViBuf)idnQuery, (ViUInt32)strlen(idnQuery), VI_NULL);

    //Unit: dBm
    sprintf(idnQuery, "CALC:UNIT:POW DBM");
    status = viWrite(scopeHandle, (ViBuf)idnQuery, (ViUInt32)strlen(idnQuery), VI_NULL);

    //Start frequency
    sprintf(idnQuery, "SENS:FREQ:STAR %i MHz", start_freq);
    status = viWrite(scopeHandle, (ViBuf)idnQuery, (ViUInt32)strlen(idnQuery), VI_NULL);

    //Stop frequency
    sprintf(idnQuery, "SENS:FREQ:STOP %i MHz", stop_freq);
    status = viWrite(scopeHandle, (ViBuf)idnQuery, (ViUInt32)strlen(idnQuery), VI_NULL);

    //Tracking generator 1 on
    sprintf(idnQuery, "OUTP1 ON");
    status = viWrite(scopeHandle, (ViBuf)idnQuery, (ViUInt32)strlen(idnQuery), VI_NULL);

    //Power mode fixed (no power sweep)
    sprintf(idnQuery, "SOUR:POW:MODE FIX");
    status = viWrite(scopeHandle, (ViBuf)idnQuery, (ViUInt32)strlen(idnQuery), VI_NULL);

    //Set source power
    sprintf(idnQuery, "SOUR:POW 0 dBm");
    status = viWrite(scopeHandle, (ViBuf)idnQuery, (ViUInt32)strlen(idnQuery), VI_NULL);

    //Calibrate transmission
    sprintf(idnQuery, "SENS:CORR:METH TRAN");
    status = viWrite(scopeHandle, (ViBuf)idnQuery, (ViUInt32)strlen(idnQuery), VI_NULL);
    sleep(1);

    //Normalization ON
    sprintf(idnQuery, "SENS:CORR:STAT ON");
    status = viWrite(scopeHandle, (ViBuf)idnQuery, (ViUInt32)strlen(idnQuery), VI_NULL);

    //Referenz level
    sprintf(idnQuery, "DISP:TRAC:Y:RLEV 0dBm");
    status = viWrite(scopeHandle, (ViBuf)idnQuery, (ViUInt32)strlen(idnQuery), VI_NULL);

    //Refernece value position
    sprintf(idnQuery, "DISP:TRAC:Y:RPOS 50PCT");
    status = viWrite(scopeHandle, (ViBuf)idnQuery, (ViUInt32)strlen(idnQuery), VI_NULL);

    sleep(1);

    //Run single
    sprintf(idnQuery, "INIT:CONT OFF");
    status = viWrite(scopeHandle, (ViBuf)idnQuery, (ViUInt32)strlen(idnQuery), VI_NULL);
    #else
    start_freq += 1;
    stop_freq += 1;
    #endif
}

void measure()
{
    #ifdef REAL
    //Initiate measurement
    sprintf(idnQuery, "INIT;*WAI");
    status = viWrite(scopeHandle, (ViBuf)idnQuery, (ViUInt32)strlen(idnQuery), VI_NULL);
    #endif
}

double get_data(int measure_freq)
{
    #ifdef REAL
    //Position marker on x-axis
    sprintf(idnQuery, "CALC:MARK1:X %dMHz", measure_freq);
    status = viWrite(scopeHandle, (ViBuf)idnQuery, (ViUInt32)strlen(idnQuery), VI_NULL);

    //Read marker data
    sprintf(idnQuery, "CALC:MARK1:Y?");
    status = viWrite(scopeHandle, (ViBuf)idnQuery, (ViUInt32)strlen(idnQuery), VI_NULL);
    status = viRead(scopeHandle, (ViBuf)idnResponse, 1024, &returnCount);
    idnResponse[returnCount] = 0;
    return strtod(idnResponse, NULL);
    #else
    measure_freq += 1;
    return 0;
    #endif
}