/*
colors.c
Simple demo of Carbon
Loop returns a value 0-1 used to set the screen color
*/

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
