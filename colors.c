double greyColor = 0.0;
double direction = 0.01;

void init() {
  a = 2;
}

double loop() {
  greyColor = greyColor + direction;

  if(greyColor > 1.0) {
    direction = -0.01;
  } else if(greyColor < 0.0) {
    direction = 0.01;
  }

  return greyColor;
}
