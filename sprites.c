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

structptr(Sprite) newSprite(double x,
                            double y,
                            double w,
                            double h,
                            double topLeftX,
                            double topLeftY,
                            double bottomRightX,
                            double bottomRightY)
{
  // generate pointer to sprite
  structptr(Sprite) ret = 8 + ((*numSprites) * 72);

  ret->x = x;
  ret->y = y;
  ret->w = w;
  ret->h = h;

  ret->tx1 = topLeftX;
  ret->ty1 = topLeftY;

  ret->tx2 = bottomRightX;
  ret->ty2 = bottomRightY;

  // alert fountain of the new sprite
  *numSprites += 1;

  return ret;
}

structptr(Sprite) heart;
structptr(Sprite) smile;

double* isTouching = 65536;
double* touchX = 65544;
double* touchY = 65552;

int direction = 0;

void init() {
  heart = newSprite(0.0, 0.0, 0.4, 0.4, // xywh
                    0.0, 0.0, 0.5, 0.5); // xyxy
  smile = newSprite(0.0, 0.0, 0.4, 0.4,
                    0.5, 0.0, 1.0, 0.5);
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
