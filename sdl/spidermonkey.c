/* This file is part of the Mico project, available under the MIT license:
 *
 *    http://www.opensource.org/licenses/mit-license.php
 */

#include "jsapi.h"
#include "SDL/SDL.h"

#define DEFAULT_WIDTH  600
#define DEFAULT_HEIGHT 600

#define DIE(s, ...) \
do { \
    fprintf (stderr, "(%s:%4d) " s "\n", __FILE__, __LINE__, ##__VA_ARGS__); \
    exit (1); \
} while (0)

#define ERROR_CHECK(f) \
    if (!(f)) DIE ("JS engine error")

static unsigned int
timer_callback (unsigned int interval, void *param)
{
    SDL_Event event;
    event.type = SDL_USEREVENT;
    event.user.data1 = param;
    SDL_PushEvent (&event);

    return 0;
}

static JSBool
sdl_addTimer (JSContext *context, JSObject *object, uintN argc,
              jsval *argv, jsval *rval)
{
    int delay;

    if (!JS_ValueToInt32 (context, argv[0], &delay))
        return JS_FALSE;
    *rval = INT_TO_JSVAL (
        SDL_AddTimer (delay, timer_callback, (void *) argv[1]));

    return JS_TRUE;
}

static JSBool
sdl_loop (JSContext *context, JSObject *object, uintN argc,
          jsval *argv, jsval *rval)
{
    SDL_Event event;
    for (;;) {
        jsval callback, rval;

        SDL_WaitEvent (&event);
        /* TODO change this to a callback too? In that case we have
         * to provide a way (in JS) to break out of the loop.
         */
        if (event.type == SDL_QUIT)
            break;
        else if (event.type == SDL_USEREVENT) {
            JS_GetProperty (context, object, "ontimer", &callback);
            if (!JSVAL_IS_VOID (callback)) {
                JS_CallFunctionValue (context, object, callback, 1,
                                      (jsval *) (char *) &event.user.data1, &rval);
            }
        }
        /* TODO I think the shift mode should be queried, using a javascript
         * version of SDL_GetModState (with slightly different functionality)
         */
        else if (event.type == SDL_MOUSEMOTION) {
            void *mark;
            jsval *argv;

            JS_GetProperty (context, object, "onmousemove", &callback);
            if (!JSVAL_IS_VOID (callback)) {
                argv = JS_PushArguments (context, &mark, "cc",
                                         event.motion.x, event.motion.y);
                JS_CallFunctionValue (context, object, callback, 2, argv, &rval);
                JS_PopArguments (context, mark);
            }
        }
        else if (event.type == SDL_MOUSEBUTTONDOWN) {
            void *mark;
            jsval *argv;

            JS_GetProperty (context, object, "onmousedown", &callback);
            if (!JSVAL_IS_VOID (callback)) {
                argv = JS_PushArguments (context, &mark, "cc",
                                         event.button.x, event.button.y);
                JS_CallFunctionValue (context, object, callback, 2, argv, &rval);
                JS_PopArguments (context, mark);
            }
        }
        else if (event.type == SDL_MOUSEBUTTONUP) {
            void *mark;
            jsval *argv;

            JS_GetProperty (context, object, "onmouseup", &callback);
            if (!JSVAL_IS_VOID (callback)) {
                argv = JS_PushArguments (context, &mark, "cc",
                                         event.button.x, event.button.y);
                JS_CallFunctionValue (context, object, callback, 2, argv, &rval);
                JS_PopArguments (context, mark);
            }
        }
    }
    return JS_TRUE;
}

static JSBool
sdl_altKeyDown (JSContext *context, JSObject *object,
                uintN argc, jsval *argv, jsval *rval)
{
    *rval = SDL_GetModState () & KMOD_ALT ? JSVAL_TRUE : JSVAL_FALSE;

    return JS_TRUE;
}

static JSBool
sdl_shiftKeyDown (JSContext *context, JSObject *object,
                uintN argc, jsval *argv, jsval *rval)
{
    *rval = SDL_GetModState () & KMOD_SHIFT ? JSVAL_TRUE : JSVAL_FALSE;

    return JS_TRUE;
}

/* TODO this should probably go in a 'finalize' function */
static JSBool
sdl_quit (JSContext *context, JSObject *object,
          uintN argc, jsval *argv, jsval *rval)
{
    SDL_Quit ();

    return JS_TRUE;
}

static JSBool
sdl_videoSurface_get_width(JSContext *context, JSObject *object,
                           jsval id, jsval *vp)
{
    *vp = INT_TO_JSVAL (SDL_GetVideoSurface ()->w);
    return JS_TRUE;
}

static JSBool
sdl_videoSurface_get_height(JSContext *context, JSObject *object,
                            jsval id, jsval *vp)
{
    *vp = INT_TO_JSVAL (SDL_GetVideoSurface ()->h);
    return JS_TRUE;
}

static JSBool
sdl_videoSurface_get_bytesPerPixel(JSContext *context, JSObject *object,
                                   jsval id, jsval *vp)
{
    *vp = INT_TO_JSVAL (SDL_GetVideoSurface ()->format->BytesPerPixel);
    return JS_TRUE;
}

static JSBool
sdl_videoSurface_get_pitch(JSContext *context, JSObject *object,
                           jsval id, jsval *vp)
{
    *vp = INT_TO_JSVAL (SDL_GetVideoSurface ()->pitch);
    return JS_TRUE;
}

static JSBool
sdl_videoSurface_get_pixels(JSContext *context, JSObject *object,
                            jsval id, jsval *vp)
{
    void *pixels = SDL_GetVideoSurface ()->pixels;
    /* FIXME hackety hack hack */
    JS_NewNumberValue (context, *((double *) (char *) &pixels), vp);
    return JS_TRUE;
}

static JSBool
sdl_videoSurface_update (JSContext *context, JSObject *object,
                         uintN argc, jsval *argv, jsval *rval)
{
    SDL_UpdateRect (SDL_GetVideoSurface (), 0, 0, 0, 0);
    return JS_TRUE;
}

void
initialize (JSContext *context)
{
    JSObject *sdl, *videoSurface;

    static JSFunctionSpec sdl_functions[] = {
        {"quit",     sdl_quit,     0, 0, 0},
        {"addTimer", sdl_addTimer, 2, 0, 0},
        {"loop",     sdl_loop,     0, 0, 0},
        {"altKeyDown", sdl_altKeyDown, 0, 0, 0},
        {"shiftKeyDown", sdl_shiftKeyDown, 0, 0, 0},
        {NULL, NULL, 0, 0, 0}
    };

    if (SDL_Init (SDL_INIT_VIDEO | SDL_INIT_TIMER) == -1)
        DIE ("SDL_Init failed: %s", SDL_GetError ());
    if (!SDL_SetVideoMode (DEFAULT_WIDTH, DEFAULT_HEIGHT, 0,
                           SDL_HWSURFACE | SDL_ANYFORMAT))
        DIE ("SDL_SetVideoMode failed: %s", SDL_GetError ());
    ERROR_CHECK(sdl = JS_DefineObject (context, JS_GetGlobalObject (context),
                                       "sdl", NULL, NULL, 0));
    ERROR_CHECK (JS_DefineFunctions (context, sdl, sdl_functions));
    ERROR_CHECK (videoSurface = JS_DefineObject (context, sdl, "videoSurface",
                                                 NULL, NULL, 0));

#define DEFINE_READ_ONLY_PROPERTY(object, name) \
    ERROR_CHECK ( \
        JS_DefineProperty (context, object, #name, JSVAL_NULL, \
                           sdl_##object##_get_##name, NULL, \
                           JSPROP_READONLY | JSPROP_PERMANENT))

    DEFINE_READ_ONLY_PROPERTY (videoSurface, width);
    DEFINE_READ_ONLY_PROPERTY (videoSurface, height);
    DEFINE_READ_ONLY_PROPERTY (videoSurface, bytesPerPixel);
    DEFINE_READ_ONLY_PROPERTY (videoSurface, pitch);
    DEFINE_READ_ONLY_PROPERTY (videoSurface, pixels);
    JS_DefineFunction (context, videoSurface, "update",
                       sdl_videoSurface_update, 0, 0);
    /* FIXME hack for demo! Should pull out of title element... */
    SDL_WM_SetCaption ("Mico - Sun Labs Lively Kernel", "Mico");
}
