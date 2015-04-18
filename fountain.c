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
