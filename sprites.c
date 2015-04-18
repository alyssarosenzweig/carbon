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
structptr(Sprite) smile = 80;

double* isTouching = 65536;
double* touchX = 65544;
double* touchY = 65552;

int direction = 0;

void init() {
  *numSprites = 2;

  heart->w = 0.4;
  heart->h = 0.4;
  smile->w = 0.4;
  smile->h = 0.4;

  heart->tx1 = 0.0;
  heart->ty1 = 0.0;
  heart->tx2 = 0.5;
  heart->ty2 = 0.5;

  smile->tx1 = 0.5;
  smile->ty1 = 0.0;
  smile->tx2 = 1.0;
  smile->ty2 = 0.5;
}

void loop() {
  heart->x = *touchX;
  heart->y = *touchY;

  if(direction == 0) {
    smile->x -= 0.01;
    smile->y -= 0.01;

    heart->a += 0.01;
  } else {
    smile->x += 0.01;
    smile->y += 0.01;

    heart->a -= 0.01;
  }

  if(smile->x > 2) {
    direction = 0;
  }

  if(smile->x < -1.9) {
    direction = 1;
  }
}
