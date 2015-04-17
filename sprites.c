int* numSprites = 0;

double* px = 8;
double* py = 16;
double* pw = 24;
double* ph = 32;
double* ptx1 = 40;
double* pty1 = 48;
double* ptx2 = 56;
double* pty2 = 64;

double* ox = 72;
double* oy = 80;
double* ow = 88;
double* oh = 96;
double* otx1 = 104;
double* oty1 = 112;
double* otx2 = 120;
double* oty2 = 128;

int direction = 0;

void init() {
  *numSprites = 2;

  *pw = 0.4;
  *ph = 0.4;
  *ow = *pw;
  *oh = *ph;

  *ptx2 = 1.0;
  *pty2 = 1.0;

  *otx1 = 0.5;
  *oty1 = 0;
  *otx2 = 1.0;
  *oty2 = 1.0;
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
