int* numSprites = 0;

double* px = 8;
double* py = 16;
double* pw = 24;
double* ph = 32;

double* ox = 40;
double* oy = 48;
double* ow = 56;
double* oh = 64;

int direction = 0;

void init() {
  *numSprites = 2;

  *pw = 0.1;
  *ph = 0.1;
  *ow = *pw;
  *oh = *ph;
}

void loop() {
  if(direction == 0) {
    *px += 0.01;
    *py += 0.01;
    *ox -= 0.01;
    *oy -= 0.01;
  } else {
    *ox += 0.01;
    *oy += 0.01;
    *px -= 0.01;
    *py -= 0.01;
  }

  if(*px > 1.5) {
    direction = 1;
  }

  if(*ox > 1.5) {
    direction = 0;
  }
}
