#include "head.h"

static uint8_t messages[5][7] = {
    {0xFF, 0x01, 0x00, 0x51, 0x00, 0x00, 0x52},
    {0xFF, 0x01, 0x00, 0x53, 0x00, 0x00, 0x54},
    {0xFF, 0x01, 0x00, 0x4B, 0x00, 0x00, 0x00},
    {0xFF, 0x01, 0x00, 0x4D, 0x00, 0x00, 0x00},
    {0xFF, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00}};

static uint8_t client_message[7], server_message[100];
static struct sockaddr_in server_addr;
static int socket_desc;
static uint16_t dec_output;
static int16_t dec_output_signed;
static struct pollfd fds[1];

static void dummy_cmd()
{
    for (int i = 0; i < 7; i++)
    {
        client_message[i] = messages[DUMMY][i];
    }
    send_message();
    receive_response();
}

uint8_t checksum(int msg)
{
    uint8_t checksum = messages[msg][1] + messages[msg][2] + messages[msg][3] + messages[msg][4] + messages[msg][5];
    return checksum;
}

void clean()
{
    memset(server_message, '0', sizeof(server_message));
    memset(client_message, '0', sizeof(client_message));
}

int create_socket()
{
    socket_desc = socket(AF_INET, SOCK_STREAM, 0);

    int state = 1;
    setsockopt(socket_desc, IPPROTO_TCP, TCP_CORK, &state, sizeof(state));
    setsockopt(socket_desc, SOL_SOCKET, SO_REUSEADDR, (char *)&state, sizeof(state));

    if (socket_desc < 0)
    {
        printf("Unable to create socket\n");
        return -1;
    }
    printf("Socket created successfully\n");

    memset(fds, 0, sizeof(fds));
    fds[0].fd = socket_desc;
    fds[0].events = POLLIN | POLLOUT;

    return socket_desc;
}

int connect_server()
{
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(8899);
    server_addr.sin_addr.s_addr = inet_addr("192.168.1.7");

    if (connect(socket_desc, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0)
    {
        printf("Unable to connect\n");
        return -1;
    }
    printf("Connected with server successfully\n");

    return 0;
}

uint16_t query_pan_position()
{
    int ret = 0;
    for (int i = 0; i < 7; i++)
    {
        client_message[i] = messages[QUERY_PAN_POSITION][i];
    }
    /* Repeat in case of invalid response or too short response */
    for (int n = 0; n < 5; n++)
    {
        send_message();
        ret = receive_response();
        if (ret >= 14 && server_message[7] == 0xff && server_message[8] == 0x01 && server_message[9] == 0x00 && server_message[10] == 0x59)
        {
            break;
        }
    }
    // PAN-Position
    dec_output = (server_message[11] << 8) + server_message[12];
    dec_output = dec_output / 100.0;
    printf("PAN-position: %u degree\n", dec_output);

    return dec_output % 360;
}

int16_t query_tilt_position()
{
    int ret = 0;
    for (int i = 0; i < 7; i++)
    {
        client_message[i] = messages[QUERY_TILT_POSITION][i];
    }
    /* Repeat in case of invalid response or too short response */
    for(int n = 0; n < 5; n++) {
        send_message();
        ret = receive_response();
        if (ret >= 14 && server_message[7] == 0xff && server_message[8] == 0x01 && server_message[9] == 0x00 && server_message[10] == 0x5b) {
            break;
        }
    }
    // TILT-Position
    dec_output = (server_message[11] << 8) + server_message[12];
    dec_output = dec_output / 100.0;
    if (dec_output > 180)
    {
        dec_output = dec_output - 360;
    }
    dec_output_signed = (int16_t)dec_output;
    printf("TILT-position: %d degree\n", dec_output_signed);

    return dec_output_signed;
}

void set_pan_position(uint16_t dec_input)
{
    dummy_cmd();
    uint16_t buffer = dec_input;
    buffer = (buffer % 360) * 100;
    messages[SET_PAN_POSITION][4] = (buffer >> 8) & 0xFF;
    messages[SET_PAN_POSITION][5] = buffer & 0xFF;
    messages[SET_PAN_POSITION][6] = checksum(SET_PAN_POSITION);
    for (int i = 0; i < 7; i++)
    {
        client_message[i] = messages[SET_PAN_POSITION][i];
    }
    send_message();
    receive_response();
    uint16_t val = 0;
    do
    {
        val = query_pan_position();
    } while (val > (dec_input % 360) + 1 || val < (dec_input % 360)-1);
}

void set_tilt_position(int16_t dec_input_signed)
{
    dummy_cmd();
    int16_t buffer = dec_input_signed;
    if (buffer > 90)
    {
        buffer = 90;
    }
    else if (buffer < -90)
    {
        buffer = -90;
    }
    if (buffer < 0)
    {
        buffer = buffer + 360;
    }
    buffer = buffer * 100;
    messages[SET_TILT_POSITION][4] = (buffer >> 8) & 0xFF;
    messages[SET_TILT_POSITION][5] = buffer & 0xFF;
    messages[SET_TILT_POSITION][6] = checksum(SET_TILT_POSITION);
    for (int i = 0; i < 7; i++)
    {
        client_message[i] = messages[SET_TILT_POSITION][i];
    }
    send_message();
    receive_response();
    int16_t val = 0;
    do
    {
        val = query_tilt_position();
    } while (val > (dec_input_signed) + 1 || val < (dec_input_signed)-1);
}

void self_check()
{
    client_message[0] = 0xFF;
    client_message[1] = 0x01;
    client_message[2] = 0x00;
    client_message[3] = 0x07;
    client_message[4] = 0x00;
    client_message[5] = 0x77;
    client_message[6] = 0x7f;
    send_message();
    receive_response();
    do
    {
        sleep(1);
    } while (query_pan_position() > 1 || query_tilt_position() > 1);
}

void home()
{
    set_pan_position(0);
    send_message();
    receive_response();
    set_tilt_position(0);
    send_message();
    receive_response();
}

int send_message()
{
    /* Wait for ready socket */
    poll(fds, 1, 3000);
    /* Send socket data */
    int len = 0;//send(socket_desc, client_message, MSG_LENGHT, 0);
    if (len < 0)
    {
        printf("Unable to send message\n");
        return -1;
    }

    return len;
}

int receive_response()
{
    /* Wait for ready socket */
    poll(fds, 1, 3000);
    /* Read socket buffer */
    int response_lenght = 0;//recv(socket_desc, server_message, sizeof(server_message), 0);
    if (response_lenght < 0)
    {
        printf("Error while receiving server's msg\n");
        return -1;
    }

    return response_lenght;
}

void close_socket()
{
    close(socket_desc);
}
