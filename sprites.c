int* numSprites = 0;

double* isTouching = 65536;
double* touchX = 65544;
double* touchY = 65552;

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

  *ptx1 = 0.0;
  *pty1 = 0.0;
  *ptx2 = 0.5;
  *pty2 = 0.5;

  *otx1 = 0.5;
  *oty1 = 0.0;
  *otx2 = 1.0;
  *oty2 = 0.5;
}

void loop() {
  if(*isTouching == 1.0) {
    *pw = 1.0;
    *ph = 1.0;
  } else {
    *pw = 0.4;
    *ph = 0.4;
  }

  *px = *touchX;
  *py = *touchY;

  if(direction == 0) {
    *ox -= 0.01;
    *oy -= 0.01;
  } else {
    *ox += 0.01;
    *oy += 0.01;
  }

  if(*ox > 1.5) {
    direction = 0;
  }

  if(*ox < -1.5) {
    direction = 1;
  }
}
