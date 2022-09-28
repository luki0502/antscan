#ifndef HELP_H
#define HELP_H

#include <argp.h>
const char *argp_program_bug_address = "Not a bug but a feature :-)";
static error_t parse_opt(int key, char *arg, struct argp_state *state);

enum
{
    OPT_GROUP = 1000,
    OPT_USER,
    OPT_WS_IP,
    OPT_WS_PORT
};

static struct argp_option options[] =
    {
        {0, 0, 0, 0, "Options:", 1},
        {"ws-ip", OPT_WS_IP, "IP", OPTION_ARG_OPTIONAL, "IP of pan-tilt head [default: 192.168.07]", 1},
        {"ws-port", OPT_WS_PORT, "port", OPTION_ARG_OPTIONAL, "Port of pan-tilt head [default: 8126]", 1},
        {"ws-group", OPT_GROUP, "group id", OPTION_ARG_OPTIONAL, "Websocket group id [default: -1]", 1},
        {"ws-user", OPT_USER, "user id", OPTION_ARG_OPTIONAL, "Websocket user id [default: -1]", 1},
        {0}};

#endif /* HELP_H */