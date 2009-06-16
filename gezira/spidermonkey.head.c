/* This file is part of the Mico project, available under the MIT license:
 *
 *    http://www.opensource.org/licenses/mit-license.php
 */

#include <stdlib.h>
#include "jsapi.h"
#include "gezira.h"

static JSBool
Renderer_constructor (JSContext *cxt, JSObject *obj, uintN argc,
                      jsval *argv, jsval *rval)
{
    double d;
    gezira_renderer *renderer =
        (gezira_renderer *) malloc (sizeof (gezira_renderer));
    JS_SetPrivate (cxt, obj, renderer);
    renderer->router = gezira_renderer_router;
    /* FIXME hackety hack hack */
    JS_ValueToNumber (cxt, argv[0], &d);
    renderer->pixmap.pixels = *((char **) (char *) &d);
    renderer->pixmap.width = JSVAL_TO_INT (argv[1]);
    renderer->pixmap.height = JSVAL_TO_INT (argv[2]);
    renderer->pixmap.stride = JSVAL_TO_INT (argv[3]);
    renderer->pixmap.bytes_per_pixel = JSVAL_TO_INT (argv[4]);

    *rval = OBJECT_TO_JSVAL (obj);
    return JS_TRUE;
}

static JSBool
Renderer_render (JSContext *cxt, JSObject *obj, uintN argc,
                 jsval *argv, jsval *rval)
{
    gezira_renderer *renderer =
        (gezira_renderer *) JS_GetPrivate (cxt, obj);
    gezira_stream *stream =
        (gezira_stream *) JS_GetPrivate (cxt, JSVAL_TO_OBJECT (argv[0]));

    gezira_render (renderer, stream);

    return JS_TRUE;
}

static JSClass Renderer_class = {
    "Renderer", JSCLASS_HAS_PRIVATE,
    JS_PropertyStub,  JS_PropertyStub, JS_PropertyStub, JS_PropertyStub,
    JS_EnumerateStub, JS_ResolveStub,  JS_ConvertStub,  JS_FinalizeStub,
    JSCLASS_NO_OPTIONAL_MEMBERS
};

static JSPropertySpec Renderer_property_specs[] = {{0, 0, 0, 0, 0}};
static JSFunctionSpec Renderer_functions[] = {
    {"render", Renderer_render, 1, 0, 0},
    {NULL, NULL, 0, 0, 0}
};

static JSBool
Node_set_children (JSContext *cxt, JSObject *obj, uintN argc,
                   jsval *argv, jsval *rval)
{
    int i;
    jsval val;
    gezira_node *node = (gezira_node *) JS_GetPrivate (cxt, obj);
    JSObject *array;

    if (argc && JS_IsArrayObject (cxt, JSVAL_TO_OBJECT (argv[0])))
        array = JSVAL_TO_OBJECT (argv[0]);
    else
        array = JS_NewArrayObject (cxt, argc, argv);

    JS_GetArrayLength (cxt, array, &node->n);
    free (node->elements);
    node->elements = (gezira_stream **)
        malloc (node->n * sizeof (gezira_stream *));

    for (i = 0; i < node->n; i++) {
        JS_GetElement (cxt, array, i, &val);
        node->elements[i] = (gezira_stream *)
            JS_GetPrivate (cxt, JSVAL_TO_OBJECT (val));
    }

    /* Need references to children to keep GC happy */
    val = OBJECT_TO_JSVAL (array);
    JS_SetProperty (cxt, obj, "_children", &val);

    *rval = OBJECT_TO_JSVAL (obj);
    return JS_TRUE;
}

static void
create_real_elements (JSContext *cxt, jsval val, gezira_real **elements, int *n)
{
    int i;
    JSObject *array = JSVAL_TO_OBJECT (val);

    JS_GetArrayLength (cxt, array, (jsuint *) n);
    *elements = (gezira_real *) malloc (*n * sizeof (gezira_real));
    //printf ("at creation, elements is %p\n", *elements);

    for (i = 0; i < *n; i++) {
        double d;
        jsval val;

        JS_GetElement (cxt, array, i, &val);
        JS_ValueToNumber (cxt, val, &d);
        (*elements)[i] = GEZIRA_REAL (d);
    }
}
