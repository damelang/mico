ENGINE = spidermonkey
PACKAGES_TO_COMPILE = sdl gezira
COMPILED_PACKAGE_EXT = .jsm
GEZIRA_REAL_TYPE = GEZIRA_REAL_FLOAT

CFLAGS = \
	-O2 -Wall -DXP_UNIX \
	-D$(GEZIRA_REAL_TYPE) \
	-DCOMPILED_PACKAGE_EXT=\"$(COMPILED_PACKAGE_EXT)\" \
	-I../../tracemonkey/js/include \
	-L../../tracemonkey/js/lib \
	-I../../gezira/gezira -I../../gezira/gezira-pixmap \
	-L../../gezira/gezira -L../../gezira/gezira-pixmap
