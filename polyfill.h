/*
polyfill.h - Carbon->C polyfill
macros to enable Carbon to be compiled with an ANSI C compliant compiler
*/

#include <stdio.h>

#define int2double(anInt) ((double) anInt)
#define double2int(aDouble) ((int) aDouble)
