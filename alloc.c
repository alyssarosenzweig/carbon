int allocedTotal = 0;

/* this is an incredibly WIP implementation of malloc.
   this is only implemented to play with pointers.
   real memory management will come soon */

void* malloc(int size) {
  allocedTotal += size;

  if(allocedTotal > 1024 * 1024) {
    return -1;
  }

  return allocedTotal - size;
}

void init() {
  int* hello = malloc(4);
  *hello = 1234;
}

double loop() {
  return 1;
}
