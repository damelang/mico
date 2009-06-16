ENGINE = spidermonkey
PACKAGES_TO_COMPILE = sdl gezira gezira_glyphserver
COMPILED_PACKAGE_EXT = .jsm
GEZIRA_REAL_TYPE = GEZIRA_REAL_FLOAT

CFLAGS = \
	-g -Wall -DXP_UNIX \
	-D$(GEZIRA_REAL_TYPE) \
	-DCOMPILED_PACKAGE_EXT=\"$(COMPILED_PACKAGE_EXT)\" \
	-I../../tracemonkey/js/include \
	-L../../tracemonkey/js/lib \
	-I../../gezira \
	-L../../gezira \
	-I/usr/include/freetype2 \
	-I../../gezira_glyphserver \
	-L../../gezira_glyphserver
