int allocedTotal = 0;

void* malloc(int size) {
  allocedTotal += size;

  if(allocedTotal > 1024 * 1024) {
    return -1;
  }

  return allocedTotal - size;
}

int* location;
int* direction;

void init() {
  location = malloc(4);
  direction = malloc(4);
  *direction = 1;
}

double loop() {
  if(*location > 16) {
    *direction = -1;
  } else if(*location < 0) {
    *direction = 1;
  }

  *location = *location + *direction;

  return int2double(*location) / 16;
}
