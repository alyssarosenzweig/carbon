int* numSprites = 0;

struct Sprite {
  double x;
  double y;
  double w;
  double h;
  double tx1;
  double ty1;
  double tx2;
  double ty2;
  double a;
};

structptr(Sprite) heart = 8;

double* isTouching = 65536;
double* touchX = 65544;
double* touchY = 65552;

double* ox = 80;
double* oy = 88;
double* ow = 96;
double* oh = 104;
double* otx1 = 112;
double* oty1 = 120;
double* otx2 = 128;
double* oty2 = 136;
double* oa = 144;

int direction = 0;

void init() {
  *numSprites = 2;

  heart->w = 0.4;
  heart->h = 0.4;
  *ow = 0.4;
  *oh = 0.4;

  heart->tx1 = 0.0;
  heart->ty1 = 0.0;
  heart->tx2 = 0.5;
  heart->ty2 = 0.5;

  *otx1 = 0.5;
  *oty1 = 0.0;
  *otx2 = 1.0;
  *oty2 = 0.5;

  *oa = 0.0;
  heart->a = 0.0;
}

void loop() {
  heart->x = *touchX;
  heart->y = *touchY;

  if(direction == 0) {
    *ox -= 0.01;
    *oy -= 0.01;

    heart->a += 0.01;
  } else {
    *ox += 0.01;
    *oy += 0.01;

    heart->a -= 0.01;
  }

  if(*ox > 2) {
    direction = 0;
  }

  if(*ox < -1.9) {
    direction = 1;
  }
}
