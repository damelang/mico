/* This file is part of the Mico project, available under the MIT license:
 *
 *    http://www.opensource.org/licenses/mit-license.php
 */

#include "jsapi.h"
#include "gezira_glyphserver.h"

static JSClass Glyphserver_class = {
    "Glyphserver", JSCLASS_HAS_PRIVATE,
    JS_PropertyStub,  JS_PropertyStub, JS_PropertyStub, JS_PropertyStub,
    JS_EnumerateStub, JS_ResolveStub,  JS_ConvertStub,  JS_FinalizeStub,
    JSCLASS_NO_OPTIONAL_MEMBERS
};

static JSBool
Glyphserver_constructor (JSContext *cxt, JSObject *obj, uintN argc,
                         jsval *argv, jsval *rval)
{
    gezira_glyphserver *server =
        (gezira_glyphserver *) malloc (sizeof (gezira_glyphserver));
    server->library = 0;
    JS_SetPrivate (cxt, obj, server);
    *rval = OBJECT_TO_JSVAL (obj);
    return JS_TRUE;
}

static JSBool
Glyphserver_glyphs (JSContext *cxt, JSObject *obj, uintN argc,
                    jsval *argv, jsval *rval)
{

    gezira_glyphserver *server =
        (gezira_glyphserver *) JS_GetPrivate (cxt, obj);
    gezira_stream *stream =
        gezira_glyphserver_glyphs (server,
            JS_GetStringBytes (JSVAL_TO_STRING (argv[0])));

    /* FIXME hackety hack */
    JSObject *paint = JS_NewObject (cxt, &Glyphserver_class, NULL, NULL);
    JS_SetPrivate (cxt, paint, stream); 
    *rval = OBJECT_TO_JSVAL (paint);

    return JS_TRUE;
}

static JSBool
Glyphserver_metrics (JSContext *cxt, JSObject *obj, uintN argc,
                     jsval *argv, jsval *rval)
{
    gezira_glyphserver *server =
        (gezira_glyphserver *) JS_GetPrivate (cxt, obj);
    jsval vals[2];
    JSObject *array;
    gezira_real x, y;

    gezira_glyphserver_get_advance (server,
        JS_GetStringBytes (JSVAL_TO_STRING (argv[0]))[0], &x, &y);
    JS_NewNumberValue (cxt, GEZIRA_REAL_TO_FLOAT (x), &vals[0]);
    JS_NewNumberValue (cxt, GEZIRA_REAL_TO_FLOAT (y), &vals[1]);
    array = JS_NewArrayObject (cxt, 2, vals);
    *rval = OBJECT_TO_JSVAL (array);

    return JS_TRUE;
}

static JSFunctionSpec Glyphserver_functions[] = {
    {"glyphs",  Glyphserver_glyphs,  1, 0, 0},
    {"metrics", Glyphserver_metrics, 1, 0, 0},
    {NULL, NULL, 0, 0, 0}
};

void
initialize (JSContext *cxt)
{
    jsval val;

    JS_GetProperty (cxt, JS_GetGlobalObject (cxt), "gezira", &val);
    JS_InitClass (cxt, JSVAL_TO_OBJECT (val), NULL, &Glyphserver_class,
                  Glyphserver_constructor, 0,
                  NULL, Glyphserver_functions,
                  NULL, NULL);
}
