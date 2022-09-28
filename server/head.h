#ifndef HEAD_H
#define HEAD_H

#include "stdint.h"
#include "stdio.h"
#include "unistd.h"
#include "string.h"
#include "sys/socket.h"
#include "arpa/inet.h"
#include <poll.h>
#include <netinet/tcp.h>

#define QUERY_PAN_POSITION 0
#define QUERY_TILT_POSITION 1
#define SET_PAN_POSITION 2
#define SET_TILT_POSITION 3
#define SELF_CHECK 4
#define DUMMY 5

#define MSG_LENGHT 7

uint8_t checksum(int msg);

void clean();

int create_socket();

int connect_server();

uint16_t query_pan_position();

int16_t query_tilt_position();

void set_pan_position(uint16_t dec_input);

void set_tilt_position(int16_t dec_input_signed);

void self_check();

void home();

int send_message();

int receive_response();

void close_socket();

#endif