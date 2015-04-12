double greyColor = 0.0;
double speed = 0.01;
double direction = 1;

void init() {

}

double loop() {
  greyColor = greyColor + speed * direction;

  if(greyColor > 1.0) {
    direction *= -1;
  } else if(greyColor < 0.0) {
    direction *= -1;
  }

  return greyColor;
}
